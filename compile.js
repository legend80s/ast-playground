const ts = require('typescript');

/**
 * @param {string[]} fileNames
 * @param {ts.CompilerOptions} options
 * @returns {number} exitCode
 */
module.exports = function compile(fileNames, options) {
  // console.time('compile');

  const program = ts.createProgram(fileNames, {
    target: ts.ScriptTarget.ES2017,
    skipLibCheck: true,
    ...options,
  });
  const emitResult = program.emit();

  // const allDiagnostics = ts
  //   .getPreEmitDiagnostics(program)
  //   .concat(emitResult.diagnostics);

  // allDiagnostics.forEach((diagnostic) => {
  //   if (diagnostic.file) {
  //     const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
  //       diagnostic.start
  //     );

  //     const message = ts.flattenDiagnosticMessageText(
  //       diagnostic.messageText,
  //       '\n'
  //     );
  //     console.log(
  //       `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
  //     );
  //   } else {
  //     console.log(
  //       `${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`
  //     );
  //   }
  // });

  const exitCode = emitResult.emitSkipped ? 1 : 0;
  // console.log(`Process exiting with code '${exitCode}'.`);
  // console.timeEnd('compile');

  return exitCode;
  // process.exit(exitCode);
};
