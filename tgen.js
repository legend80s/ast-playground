const fs = require('fs');
const { promisify } = require('util');
const babel = require('@babel/core');
const t = require('babel-types');
const compile = require('./compile');
const chokidar = require('chokidar');

const exec = promisify(require('child_process').exec);
const write = promisify(fs.writeFile);
const read = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

/**
 * @param {string} type store page component app
 */
async function typify(type, path) {
  const mapping = {
    store: typifyStore,
  };

  const func = mapping[type];
  const types = Object.keys(mapping);

  if (!func) {
    throw new RangeError(
      'type not supported, allowed types: ' + types.join(', ')
    );
  }

  func(path);
}

function getFilePaths(path) {
  const SPEC = 'store';

  const sourceCodeFile = path;
  const targetTypingFile = `./typings/${SPEC}.d.ts`;
  const templateTypingFile = `./${SPEC}.d.ts.tmpl`;
  const codeFilePath = `./typings/${SPEC}-options.generated.ts`;
  const compiledJsFile = codeFilePath.replace(/\.ts$/, '.js');

  return {
    sourceCodeFile,
    targetTypingFile,
    templateTypingFile,
    codeFilePath,
    compiledJsFile,
  };

  // const sourceCodeFile = `./${SPEC}.ts`;
  // const targetTypingFile = `./typings/${SPEC}.d.ts`;
  // const templateTypingFile = `./${SPEC}.d.ts.tmpl`;
  // const codeFilePath = `./typings/${SPEC}-options.generated.ts`;
  // const compiledJsFile = codeFilePath.replace(/\.ts$/, '.js');
}

async function typifyStore(path) {
  const {
    sourceCodeFile,
    targetTypingFile,
    templateTypingFile,
    codeFilePath,
    compiledJsFile,
  } = getFilePaths(path);

  console.log('typifyStore');
  const mainLabel = `typings generated into ${targetTypingFile} ✨`;
  console.time(mainLabel);

  const optionsSourceCode = await extractStoreOptions(sourceCodeFile);

  // console.log('optionsSourceCode:', optionsSourceCode);

  if (!optionsSourceCode) {
    return;
  }

  try {
    await write(codeFilePath, optionsSourceCode);
  } catch (error) {
    return console.error(
      'write store options to ./store-options.generated.ts failed',
      error
    );
  }

  const optionsTypingsFilePath = codeFilePath.replace(/\.ts$/, '.d.ts');

  try {
    await toTypings(codeFilePath);
  } catch (error) {
    return console.error(`exec \`${cmd}\` failed`, error);
  }

  try {
    await insertTypings(
      optionsTypingsFilePath,
      templateTypingFile,
      targetTypingFile
    );
  } catch (error) {
    console.error('insertTypings failed', error);
  } finally {
    try {
      await clean(codeFilePath, compiledJsFile, optionsTypingsFilePath);
    } catch (error) {
      return console.error('clean auto generated files failed', error);
    }
  }

  console.timeEnd(mainLabel);
}

function toTypings(codeFilePath) {
  // const cmd = `./node_modules/.bin/tsc --declaration ${codeFilePath}`;

  return compile([codeFilePath], {
    declaration: true,
  });

  // return exec(cmd);
}

async function extractStoreOptions(sourceCodeFile) {
  const visitor = {
    ImportDeclaration(path) {
      path.remove();
    },

    ExpressionStatement(path) {
      // console.log('path:', path);
      // console.log(
      //   'path.node.type:',
      //   path.node.type,
      //   path.node.expression.callee.name
      // );

      const { node } = path;

      if (!node.expression.callee || node.expression.callee.name !== 'Store') {
        return;
      }

      const arg = path.node.expression.arguments[0];

      path.replaceWith(
        t.variableDeclaration('const', [
          t.variableDeclarator(t.identifier('UserOptions'), arg),
        ])
      );
    },
  };

  let sourceCode = '';

  try {
    sourceCode = await read(sourceCodeFile);
  } catch (error) {
    return console.error(
      `read source code file ${sourceCodeFile} failed`,
      error
    );
  }

  let result;

  try {
    result = await babel.transformAsync(sourceCode, {
      ast: true,
      plugins: ['@babel/plugin-transform-typescript', { visitor }],
    });

    return result.code;
  } catch (error) {
    console.error('transformAsync failed', error);
    return '';
  }
}

async function insertTypings(from, template, to) {
  const [userOptionsTypings, templateContent] = await Promise.all([
    read(from),
    read(template),
  ]);

  return write(to, `${templateContent}\n${declareToType(userOptionsTypings)}`);
}

/**
 * 'declare const UserOptions:' to 'type UserOptions ='
 * 防止 UserOptions 泄露
 * @param {string} declare
 */
function declareToType(declare) {
  // console.log('declare.toString():', declare.toString());
  return declare
    .toString()
    .replace('declare const UserOptions:', 'type UserOptions =');
}

function clean(...files) {
  // console.log('cleaing files:', files.join(', '));
  return files.map((file) =>
    unlink(file).catch((error) => {
      error.code !== 'ENOENT' && console.error(error);
    })
  );
}

const watcher = chokidar.watch('**/store.(t|j)s', {
  ignored: /(^|[\/\\])\..|node_modules/,
});

watcher.on('change', (path, stats) => {
  console.log(path, 'changed');
  typify('store', path);
});

watcher.on('add', (path, stats) => {
  console.log(path, 'added');
  typify('store', path);
});
