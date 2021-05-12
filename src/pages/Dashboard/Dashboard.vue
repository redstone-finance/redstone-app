<template>
  <div class="dashboard-page">
    <h1 class="page-title"><small>Tokens</small></h1>
    <b-row>

      <b-col md="6" xl="4" sm="6" xs="12" v-for="token in tokens">
        <div class="pb-xlg" @click="$router.push('/app/components/charts')">
          <Widget class="mb-0" style="height: 60px; cursor: pointer;"

          >
            <div class="d-flex align-items-center mb-lg">
              <img :src="token.logo" style="height: 30px;">
              <h4 style="margin-bottom: 0px; margin-left: 10px;">{{token.name}}</h4>
              <h2 style="position:absolute; right:20px;">${{token.price}}</h2>
              <!--
              <i class="la la-arrow-right text-success la-lg rotate-315" />
              -->
            </div>
          </Widget>
        </div>
      </b-col>



      <!--<b-col md="6" xl="3" sm="6" xs="12">-->
        <!--<div class="pb-xlg h-100">-->
          <!--<Widget class="h-100 mb-0" title="Revenue Breakdown" close>-->
            <!--<highcharts :options="donut"></highcharts>-->
          <!--</Widget>-->
        <!--</div>-->
      <!--</b-col>-->
      <!--<b-col md="6" xl="3" sm="6" xs="12">-->
        <!--<div class="pb-xlg h-100">-->
          <!--<Widget class="h-100 mb-0" title="App Perfomance" close>-->
            <!--<p class="text-muted d-flex flex-wrap">-->
              <!--<small class="mr-lg d-flex align-items-center">-->
                <!--<span class="circle bg-danger text-danger mr-xs" style="font-size: 4px;">-->
                  <!--.-->
                <!--</span>-->
                  <!--This Period-->
              <!--</small>-->
              <!--<small class="mr-lg d-flex align-items-center">-->
                <!--<span class="circle bg-primary text-primary mr-xs" style="font-size: 4px;">-->
                  <!--.-->
                <!--</span>-->
                <!--Last Period-->
              <!--</small>-->
            <!--</p>-->
            <!--<h6>SDK</h6>-->
            <!--<b-progress class="mb-xs" style="height: 5px"-->
              <!--variant="danger" :value="60" :max="100" />-->
            <!--<b-progress class="mb" style="height: 5px"-->
              <!--variant="primary" :value="35" :max="100" />-->
            <!--<h6>Integration</h6>-->
            <!--<b-progress class="mb-xs" style="height: 5px"-->
              <!--variant="danger" :value="40" :max="100" />-->
            <!--<b-progress style="height: 5px"-->
              <!--variant="primary" :value="55" :max="100" />-->
          <!--</Widget>-->
        <!--</div>-->
      <!--</b-col>-->
      <!--<b-col md="6" xl="3" sm="6" xs="12">-->
        <!--<div class="pb-xlg h-100">-->
          <!--<Widget class="h-100 mb-0" title="Server Overview" close>-->
            <!--<div class="d-flex align-items-center mb-sm">-->
              <!--<p class="width-150"><small>60% / 37°С / 3.3 Ghz</small></p>-->
              <!--<div style="width: calc(100% - 150px)">-->
                <!--<trend-->
                  <!--:data="getRandomData()"-->
                  <!--:gradient="[appConfig.colors.danger]"-->
                  <!--:height="40"-->
                  <!--stroke-width="4"-->
                  <!--smooth />-->
              <!--</div>-->
            <!--</div>-->
            <!--<div class="d-flex align-items-center mb-sm">-->
              <!--<p class="width-150"><small>54% / 31°С / 3.3 Ghz</small></p>-->
              <!--<div style="width: calc(100% - 150px)">-->
                <!--<trend-->
                  <!--:data="getRandomData()"-->
                  <!--:gradient="[appConfig.colors.info]"-->
                  <!--:height="40"-->
                  <!--stroke-width="4"-->
                  <!--smooth />-->
              <!--</div>-->
            <!--</div>-->
            <!--<div class="d-flex align-items-center">-->
              <!--<p class="width-150"><small>57% / 21°С / 3.3 Ghz</small></p>-->
              <!--<div style="width: calc(100% - 150px)">-->
                <!--<trend-->
                  <!--:data="getRandomData()"-->
                  <!--:gradient="[appConfig.colors.primary]"-->
                  <!--:height="40"-->
                  <!--stroke-width="4"-->
                  <!--smooth />-->
              <!--</div>-->
            <!--</div>-->
          <!--</Widget>-->
        <!--</div>-->
      <!--</b-col>-->
    </b-row>


  </div>
</template>

<script>
import Widget from '@/components/Widget/Widget';
import BigStat from './components/BigStat/BigStat';
import mock from './mock';

import { Chart } from 'highcharts-vue';

export default {
  name: 'Dashboard',
  components: {
    Widget, BigStat, highcharts: Chart
  },
  data() {
    return {
      mock,
      tokens: [
        {name: "Ethereum", price: "1,750.23", logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png"},
        {name: "Bitcoin", price: "57,267.64", logo: "https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=010"},
        {name: "AR", price: "14.73", logo: "https://cryptologos.cc/logos/arweave-ar-logo.png?v=010"},
        {name: "Ethereum", price: "1,750.23", logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png"},
        {name: "Bitcoin", price: "57,267.64", logo: "https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=010"},
        {name: "AR", price: "14.73", logo: "https://cryptologos.cc/logos/arweave-ar-logo.png?v=010"},
        {name: "Ethereum", price: "1,750.23", logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png"},
        {name: "Bitcoin", price: "57,267.64", logo: "https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=010"},
        {name: "AR", price: "14.73", logo: "https://cryptologos.cc/logos/arweave-ar-logo.png?v=010"},
        {name: "Ethereum", price: "1,750.23", logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png"},
        {name: "Bitcoin", price: "57,267.64", logo: "https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=010"},
        {name: "AR", price: "14.73", logo: "https://cryptologos.cc/logos/arweave-ar-logo.png?v=010"},
        {name: "Ethereum", price: "1,750.23", logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png"},
        {name: "Bitcoin", price: "57,267.64", logo: "https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=010"},
        {name: "AR", price: "14.73", logo: "https://cryptologos.cc/logos/arweave-ar-logo.png?v=010"},
        {name: "Ethereum", price: "1,750.23", logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png"},
        {name: "Bitcoin", price: "57,267.64", logo: "https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=010"},
        {name: "AR", price: "14.73", logo: "https://cryptologos.cc/logos/arweave-ar-logo.png?v=010"},

      ]
    };
  },
  methods: {
    getRandomData() {
      const arr = [];

      for (let i = 0; i < 25; i += 1) {
        arr.push(Math.random().toFixed(1) * 10);
      }

      return arr;
    },
    getRevenueData() {
      const data = [];
      const seriesCount = 3;
      const accessories = ['SMX', 'Direct', 'Networks'];

      for (let i = 0; i < seriesCount; i += 1) {
        data.push({
          label: accessories[i],
          data: Math.floor(Math.random() * 100) + 1,
        });
      }

      return data;
    }
  },
  computed: {
    donut() {
      let revenueData = this.getRevenueData();
      let {danger, info, primary} = this.appConfig.colors;
      let series = [
        {
          name: 'Revenue',
          data: revenueData.map(s => {
            return {
              name: s.label,
              y: s.data
            }
          })
        }
      ];
      return {
        chart: {
          type: 'pie',
          height: 120
        },
        credits: {
          enabled: false
        },
        title: false,
        plotOptions: {
          pie: {
            dataLabels: {
              enabled: false
            },
            borderColor: null,
            showInLegend: true,
            innerSize: 60,
            size: 100,
            states: {
              hover: {
                halo: {
                  size: 1
                }
              }
            }
          }
        },
        colors: [danger, info, primary],
        legend: {
          align: 'right',
          verticalAlign: 'middle',
          layout: 'vertical',
          itemStyle: {
            color: '#495057',
            fontWeight: 100,
            fontFamily: 'Montserrat'
          },
          itemMarginBottom: 5,
          symbolRadius: 0
        },
        exporting: {
          enabled: false
        },
        series
      };
    }
  }
};
</script>

<style src="./Dashboard.scss" lang="scss" />
