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
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

import store from './store';
import router from './Routes';
import App from './App';
import layoutMixin from './mixins/layout';
import utilsMixin from './mixins/utils';
import Widget from './components/Widget/Widget';

Vue.use(BootstrapVue, {
  breakpoints: [`xs`, 'sm', 'md', 'lg', 'xl', 'xxl']
});
Vue.use(VueTouch);
Vue.use(Trend);
Vue.component('Widget', Widget);

Vue.component('apexchart', VueApexCharts);
Vue.mixin(layoutMixin);
Vue.mixin(utilsMixin);
Vue.use(Toasted, {duration: 10000});
Vue.use(VueLoaders);
Vue.use(VueTimers)

Vue.config.productionTip = false;

Vue.directive('observe-visibility', ObserveVisibility);

function setupFilters() {
  Vue.filter('price', (value, opts = {}) => {
    if (isNaN(value)) {
      return value;
    } else {
      const price = Math.abs(value);
      const optionalPlus = addPlus(value, opts.showPlus);

      if (price === 0) {
        return "0.00";
      } else if (price < 0.0000001) {
        // For extrmely small values we use E notation
        // If `eNotationForSmallValues` option is set to true
        return opts.eNotationForSmallValues
          ? price.toExponential(3)
          : optionalPlus + '$' + price.toFixed(12);
      } else if (price < 0.01) {
        // For small values we display 6 digits after comma
        return optionalPlus + '$' + price.toFixed(6);
      } else {
        // For standard values we just format price in a standard way
        return optionalPlus + new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(price);
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

  Vue.filter('maxLength', function(value, maxLen) {
    if (!value) return '';
    return (value.length > maxLen)
      ? value.substr(0, maxLen - 3) + "..."
      : value;
  });

  Vue.filter('bigInt', function(value) {
    if (!value) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
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
