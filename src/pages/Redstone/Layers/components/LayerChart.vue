<template>
    <div>
      <bar-chart :chart-data="chartData" />
    </div>
  </template>
  
  <script>
  import { Bar } from 'vue-chartjs';
  import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
  
  ChartJS.plugins.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);
  
  export default {
    name: 'GasUsageChart',
    components: {
      BarChart: {
        extends: Bar,
        props: {
          chartData: {
            type: Object,
            required: true
          }
        },
        mounted() {
          this.renderChart(this.chartData, {
            responsive: true,
            maintainAspectRatio: false
          });
        }
      }
    },
    props: {
      data: {
        type: Array,
        required: true
      }
    },
    computed: {
      chartData() {
        const dateCounts = this.data.reduce((acc, entry) => {
          const date = entry.timeStamp.split(' ')[0]; // assuming timeStamp includes time
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});
  
        return {
          labels: Object.keys(dateCounts),
          datasets: [
            {
              label: 'Number of actions',
              backgroundColor: '#FD627A',
              data: Object.values(dateCounts)
            }
          ]
        };
      }
    }
  };
  </script>
  
  <style scoped>
  div {
    position: relative;
    height: 400px;
  }
  </style>
  