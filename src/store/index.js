import Vue from 'vue';
import Vuex from 'vuex';

import layout from './layout';
import cache from './cache';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    layout,
    cache
  },
});
