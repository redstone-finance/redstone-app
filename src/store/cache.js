export default {
  namespaced: true,
  state: {
    providers: null
  },
  mutations: {
    updateProviders(state, value) {
      if (value) {
        state.providers = value;
      }
    }
  },
  actions: {
    updateProviders({ commit }, providers) {
      commit('updateProviders', providers);
    },
  },
};
