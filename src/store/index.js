import Vue from 'vue';
import Vuex from 'vuex';

import layout from './layout';
import prefetch from './prefetch';
import prices from './prices';
import layers from './layers';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    layout,
    prefetch,
    prices,
    layers
  },
});
