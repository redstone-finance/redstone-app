<template>
  <div class="chart-container">
    <div class="range-buttons">
      <button @click="setRange('1d')" :class="{ active: currentRange === '1d' }">1 Day</button>
      <button @click="setRange('1w')" :class="{ active: currentRange === '1w' }">1 Week</button>
      <button @click="setRange('1m')" :class="{ active: currentRange === '1m' }">1 Month</button>
    </div>
    <canvas ref="chart"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js'

const crosshairPlugin = {
  afterDatasetsDraw: function (chart) {
    if (chart.tooltip._active && chart.tooltip._active.length) {
      var activePoint = chart.tooltip._active[0],
        ctx = chart.ctx,
        x = activePoint.tooltipPosition().x,
        y = activePoint.tooltipPosition().y,
        topY = chart.scales['y-axis-0'].top,
        bottomY = chart.scales['y-axis-0'].bottom,
        leftX = chart.scales['x-axis-0'].left,
        rightX = chart.scales['x-axis-0'].right;

      // Set the line color
      ctx.strokeStyle = 'rgba(253, 98, 122, 0.75)'; // Using the specified color with 75% opacity

      // draw vertical line
      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.lineTo(x, bottomY);
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 6]);
      ctx.stroke();

      // draw horizontal line
      ctx.beginPath();
      ctx.moveTo(leftX, y);
      ctx.lineTo(rightX, y);
      ctx.stroke();
    }
  }
};

Chart.pluginService.register(crosshairPlugin);

export default {
  name: 'BlockchainChart',
  props: {
    data: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      chart: null,
      currentRange: '1m' // Default to 1 month view
    }
  },
  computed: {
    filteredData() {
      const now = new Date();
      let startDate;

      switch (this.currentRange) {
        case '1d':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '1w':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '1m':
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      return this.data.filter(entry => new Date(entry.timestamp) >= startDate);
    },
    chartData() {
      return {
        labels: this.filteredData.map(entry => new Date(entry.timestamp)),
        datasets: [
          {
            label: 'Price',
            borderColor: '#FD627A',
            data: this.filteredData.map(entry => entry.value),
            fill: true,
            lineTension: 0.1
          }
        ]
      };
    }
  },
  mounted() {
    this.createChart();
    setTimeout(() => {
      this.updateGradient();
    }, 0);
  },
  methods: {
    createGradient(ctx, chartArea) {
      const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
      gradient.addColorStop(0, 'rgba(253, 98, 122, 0)');     // Fully transparent at the bottom
      gradient.addColorStop(0.5, 'rgba(253, 98, 122, 0.1)'); // 10% opacity in the middle
      gradient.addColorStop(1, 'rgba(253, 98, 122, 0.2)');   // 20% opacity at the top
      return gradient;
    },
    createChart() {
      const ctx = this.$refs.chart.getContext('2d');

      this.chart = new Chart(ctx, {
        type: 'line',
        data: this.chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            display: false
          },
          tooltips: {
            mode: 'index',
            intersect: false,
            position: 'nearest',
            callbacks: {
              label: (tooltipItem, data) => {
                const dataIndex = tooltipItem.index;
                const value = data.datasets[0].data[dataIndex];
                const block = this.filteredData[dataIndex].block;
                return `Block: ${block}, Price: $${value.toFixed(2)}`;
              }
            }
          },
          hover: {
            mode: 'index',
            intersect: false
          },
          layout: {
            padding: {
              bottom: 20
            }
          },
          scales: {
            xAxes: [{
              type: 'time',
              time: {
                unit: this.getTimeUnit(),
                displayFormats: {
                  hour: 'HH:mm',
                  day: 'MMM D',
                  week: 'MMM D',
                  month: 'MMM YYYY'
                }
              },
              display: true,
              gridLines: {
                display: false,
                drawBorder: true,
                drawOnChartArea: false
              },
              ticks: {
                display: true,
                padding: 20
              }
            }],
            yAxes: [{
              display: true,
              ticks: {
                beginAtZero: false,
                callback: function (value, index, values) {
                  return '$' + value.toFixed(2);
                }
              },
              gridLines: {
                display: true
              }
            }]
          },
          plugins: {
            crosshair: true
          }
        }
      });

      // Apply gradient after chart creation
      this.updateGradient();
    },
    updateChart() {
      if (this.chart) {
        this.chart.data = this.chartData;
        this.chart.options.scales.xAxes[0].time.unit = this.getTimeUnit();
        this.updateGradient();
        this.chart.update();
      }
    },
    updateGradient() {
      if (this.chart && this.chart.chartArea) {
        const chartArea = this.chart.chartArea;
        const ctx = this.chart.ctx;
        const gradient = this.createGradient(ctx, chartArea);
        this.chart.data.datasets[0].backgroundColor = gradient;
        this.chart.update();
      }
    },
    setRange(range) {
      this.currentRange = range;
      this.updateChart();
    },
    getTimeUnit() {
      switch (this.currentRange) {
        case '1d':
          return 'hour';
        case '1w':
          return 'day';
        case '1m':
        default:
          return 'week';
      }
    }
  },
  watch: {
    data: {
      handler() {
        this.updateChart();
      },
      deep: true
    }
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
</script>

<style scoped>
.chart-container {
  height: 550px;
  width: 100%;
}

.range-buttons {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.range-buttons button {
  margin-left: 10px;
  padding: 5px 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  background-color: #fff;
  cursor: pointer;
}

.range-buttons button.active {
  background-color: #FD627A;
  color: #fff;
}
</style>