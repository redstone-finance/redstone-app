// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
// import * as VueGoogleMaps from 'vue2-google-maps';
import VueTouch from 'vue-touch';
import Trend from 'vuetrend';
import Toasted from 'vue-toasted';
import VueApexCharts from 'vue-apexcharts';
import VueLoaders from 'vue-loaders';
import VueTimers from 'vue-timers'
import { ObserveVisibility } from 'vue-observe-visibility';
import 'vue-loaders/dist/vue-loaders.css';

import store from './store';
import router from './Routes';
import App from './App';
import layoutMixin from './mixins/layout';
import Widget from './components/Widget/Widget';

Vue.use(BootstrapVue);
Vue.use(VueTouch);
Vue.use(Trend);
Vue.component('Widget', Widget);

Vue.component('apexchart', VueApexCharts);
Vue.mixin(layoutMixin);
Vue.use(Toasted, {duration: 10000});
Vue.use(VueLoaders);
Vue.use(VueTimers)

Vue.config.productionTip = false;

Vue.directive('observe-visibility', ObserveVisibility);

function setupFilters() {
  Vue.filter('price', (value) => {
    if (isNaN(value)) {
      return value;
    } else {
      if (value < 0.01) {
        // Small prices
        return '$' + Number(value).toFixed(6);
      } else {
        return new Intl.NumberFormat(
          'en-US',
          {
            style: 'currency',
            currency: 'USD',
          }
        ).format(value);
      }
    }
  });
  
  Vue.filter('tx', function (value) {
    if (!value) return '';
    return value.substr(0, 6) + "..." + value.substr(value.length - 6);
  });
}

setupFilters();

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App),
});
