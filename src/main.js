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
import arweaveMixin from './mixins/arweave';
import Widget from './components/Widget/Widget';

Vue.use(BootstrapVue);
Vue.use(VueTouch);
Vue.use(Trend);
Vue.component('Widget', Widget);

Vue.component('apexchart', VueApexCharts);
Vue.mixin(layoutMixin);
Vue.mixin(arweaveMixin);
Vue.use(Toasted, {duration: 10000});
Vue.use(VueLoaders);
Vue.use(VueTimers)

Vue.config.productionTip = false;

Vue.directive('observe-visibility', ObserveVisibility);

function setupFilters() {
  Vue.filter('price', (value, showPlus) => {
    if (isNaN(value)) {
      return value;
    } else {
      if (Math.abs(value) < 0.01) {
        // Small prices
        return addPlus(value, showPlus) + '$' + Number(value).toFixed(6);
      } else {
        return addPlus(value, showPlus) + new Intl.NumberFormat(
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

  Vue.filter('percentage', function (value, showPlus) {
    if (!value) return '';
    return addPlus(value, showPlus) + (value * 100).toFixed(2) + "%";
  });

  Vue.filter('date', function (value) {
    if (!value) {
      return null;
    }
    if (typeof value === 'string') {
      value = new Date(value)
    }
    return value.toLocaleDateString("en-GB");
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

function addPlus(value, show) {
  return ((show && value > 0) ? "+" : "");
}
