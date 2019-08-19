import { Store } from 'herbjs';
import { getIn } from 'herbjs/utils';

Store({
  state: {
    pageName: '首页',
  },
  getters: {
    // getIn 方法包含防空处理, getIn(context, 数据访问路径, 默认值)
    isDataReady: (state, getters, global) => !!getIn(global, ['result']),
    title: (state, getters, global) => getIn(global, ['result', 'title'], ''),
    demoList: (state, getters, global) => getIn(global, ['result', 'data'], []),
    count: (state, getters) => getters.demoList.length,
  },
  mutations: {},
  actions: {},
});
