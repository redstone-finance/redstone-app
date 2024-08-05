<template>
  <div>
    <line-chart :chart-data="chartData" />
  </div>
</template>

<script>
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.plugins.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);

export default {
  name: 'LayerChart',
  components: {
    LineChart: {
      extends: Line,
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
            borderColor: '#FD627A',
            backgroundColor: 'rgba(253, 98, 122, 0.1)',
            data: Object.values(dateCounts),
            fill: true,
            tension: 0.4
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