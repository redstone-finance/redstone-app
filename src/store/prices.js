export default {
  namespaced: true,
  state: {
    pricesLoadingCompleted: false,
    prices: {},
  },
  mutations: {
    addPrices(state, pricesToAdd) {
      state.prices = {
        ...state.prices,
        ...pricesToAdd,
      };
    },

    setPricesLoadingAsCompleted(state) {
      state.pricesLoadingCompleted = true;
    },

  },
  actions: {
    addPrices({ commit }, pricesToAdd) {
      commit('addPrices', pricesToAdd);
    },

    setPricesLoadingAsCompleted({ commit }) {
      commit('setPricesLoadingAsCompleted');
    },
  },
};
