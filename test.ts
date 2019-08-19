const options = {
  state: {
    a: 1,
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
      state.a += payload;
    },
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

    async action2({ state, commit, global, dispatch }, payload): Promise<string> {
      // state.a
      commit('f', 1);
      return await dispatch('action1', '1');
    },

    action3({ state, commit, global, dispatch }, payload: number) {
      return true;
    },
  },
}