<template>
  <div class="charts-overview">
    <h1 class="page-title">
      Ethereum
    </h1>
    <div>
      <b-row>
        <b-col xs='12' lg='12'>
          <Widget
                  close collapse customHeader
                  style="height: 400px;"
          >
          <b-row>
            <b-col xs="12" lg="9">
               <highcharts :options="ld" ref="highchart"></highcharts>
            </b-col>

              <b-col xs="12" lg="3">
                  <h3 style="margin-bottom: 20px;">Data sources</h3>
                  <div class="abc-checkbox">
                      <input type="checkbox" id="checkbox1"/>
                      <label for="checkbox1" style="font-size: 1.5em;">
                          <span style="margin-left:10px; font-weight: 300" class="text-muted">Coingecko</span>
                          <span style="float:right;" >$1,430</span>
                      </label>
                  </div>

                  <div class="abc-checkbox">
                      <input type="checkbox" id="checkbox1"/>
                      <label for="checkbox1" style="font-size: 1.5em;">
                          <span style="margin-left:10px; font-weight: 300" class="text-muted">Kyber</span>
                          <span style="float:right;" class="fw-semi-bold">$1,438</span>
                      </label>
                  </div>

                  <div class="abc-checkbox">
                      <input type="checkbox" id="checkbox1"/>
                      <label for="checkbox1" style="font-size: 1.5em;">
                          <span style="margin-left:10px; font-weight: 300" class="text-muted">Uniswap</span>
                          <span style="float:right;" >$1,432</span>
                      </label>
                  </div>

                  <div class="abc-checkbox">
                      <input type="checkbox" id="checkbox1"/>
                      <label for="checkbox1" style="font-size: 1.5em;">
                          <span style="margin-left:10px; font-weight: 300" class="text-muted">Balancer</span>
                          <span style="float:right;" >$1,433</span>
                      </label>
                  </div>

              </b-col>
          </b-row>


          </Widget>

        </b-col>

      </b-row>
    </div>
      <b-tabs nav-class="bg-transparent">
          <b-tab title="Price feeds" active>
              <div class="table-responsive">
                  <table class="table table-hover">
                      <thead>
                      <tr>
                          <th>#</th>
                          <th>Date</th>
                          <th>Value</th>
                          <th>Arweave tx</th>
                          <th>Action</th>
                      </tr>
                      </thead>
                      <tbody>
                      <tr>
                          <td>1</td>
                          <td>05/03/2021 19:47:21</td>
                          <td class="fw-semi-bold">$1,421</td>
                          <td><a href="#">ffnAyXDLbBnDOmJAcXStdqgXH73GPkYe4IvFXl0qgO4</a></td>
                          <td><button class="btn btn-block btn-danger">Raise dispute</button></td>
                      </tr>
                      <tr>
                          <td>2</td>
                          <td>05/03/2021 19:47:11</td>
                          <td class="fw-semi-bold">$1,422</td>
                          <td><a href="#">ffnAyXDLbBn745jo3Std1254qgXH73GPkYe4IvFXl0qgO4</a></td>
                          <td><button class="btn btn-block btn-danger">Raise dispute</button></td>
                      </tr>
                      <tr>
                          <td>3</td>
                          <td>05/03/2021 19:47:01</td>
                          <td class="fw-semi-bold">$1,423</td>
                          <td><a href="#">ffnAyXDLbBnDOmJAcXStdqgXH73GPkYe4IvFXl0qgO4</a></td>
                          <td><button class="btn btn-block btn-danger">Raise dispute</button></td>
                      </tr>
                      <tr>
                          <td>4</td>
                          <td>05/03/2021 19:46:51</td>
                          <td class="fw-semi-bold">$1,420</td>
                          <td><a href="#">ffnAyXDLbBnDOmJAcXStdqgXH73GPkYe4IvFXl0qgO4</a></td>
                          <td><button class="btn btn-block btn-danger">Raise dispute</button></td>
                      </tr>
                      </tbody>
                  </table>
              </div>
          </b-tab>
          <b-tab title="API">
              Fetch the AR token price with just one line of code using Limestone API:

              <div style="background-color: #f8f8f8; font-family: Courier; margin-top: 15px;">
              const Limestone = require('@limestone/api'); <br/>

              let price = await Limestone.getPrice("TOKEN_SYMBOL"); <br/>

              //The price is returned in the following format: <br/>
              { <br/>
              &nbsp;&nbsp; price: 2.05, //as Float <br/>
              &nbsp;&nbsp; updated: '2020-11-03 16:00:00', //as Date <br/>
              } <br/>

              </div>


          </b-tab>
          <b-tab title="Token details">
              Second tab content
          </b-tab>
      </b-tabs>


  </div>
</template>

<script>
import Widget from "@/components/Widget/Widget";
import {chartData, liveChart, liveChartInterval} from './mock';
import { BTabs, BTab } from 'bootstrap-vue';

import ECharts from 'vue-echarts/components/ECharts';
import 'echarts/lib/chart/pie';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/themeRiver';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/legend';

import Highcharts from 'highcharts';
import exporting from 'highcharts/modules/exporting';
import exportData from 'highcharts/modules/export-data';

exporting(Highcharts);
exportData(Highcharts);

import { Chart } from 'highcharts-vue';
import Sparklines from '../../components/Sparklines/Sparklines'

export default {
  name: "Charts",
  components: { Widget, echart: ECharts, highcharts: Chart, Sparklines, BTabs, BTab },
  data() {
    return {
      cd: chartData,
      ld: liveChart,
      initEchartsOptions: {
        renderer: 'canvas'
      },
    };
  },
  computed: {
    sparklineData() {
      return {
        series: [{data: [1, 7, 3, 5, 7, 8]}],
        options1: {
          colors: [this.appConfig.colors.primary],
          plotOptions: {
            bar: {
              columnWidth: '50%'
            }
          }
        },
        options2: {
          colors: [this.appConfig.colors.info],
          plotOptions: {
            bar: {
              columnWidth: '50%'
            }
          }
        }
      }
    }
  },
  beforeDestroy() {
    clearInterval(liveChartInterval);
  }
};
</script>

<style>
    .abc-checkbox label::before {
        height: 20px !important;
        width: 20px !important;
    }
</style>
