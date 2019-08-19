import { Store } from 'herbjs';

Store({
  state: {
    a: 1,
    b: '1',
  },

  getters: {
    c(state, getters, global) {
      getters.d;
      return state.a;
    },

    d() {
      return '1';
    },
  },

  mutations: {
    e(state, payload) {
      state.a = payload.length;
    },

    f(state, payload) {
      state.a += Number(state.b);
    },

    g() { },
  },

  actions: {
    action1({ state, commit, global, dispatch }, payload) {
      // state.a
      commit('f', 1);
      dispatch('action2', 1);
      dispatch('action3', false);

      global.x;
      return state.a;
    },

    async action2({ state, commit, global, dispatch }, payload) {
      // state.a
      commit('f', 2);
      commit('g');
      return await dispatch('action1', '1');
    },

    action3({ state, commit, global, dispatch }, payload) {
      dispatch('action4');
      return '1';
    },

    action4() {
      return 'false';
    },
  },
});
