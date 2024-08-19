<template>
  <div class="chart-container">
    <canvas ref="chart"></canvas>
    <button @click="resetZoom">Reset Zoom</button>
  </div>
</template>

<script>
import Chart from "chart.js";
import ChartZoom from "chartjs-plugin-zoom";

Chart.plugins.register(ChartZoom);

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

      ctx.strokeStyle = "rgba(253, 98, 122, 0.75)";

      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.lineTo(x, bottomY);
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 6]);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(leftX, y);
      ctx.lineTo(rightX, y);
      ctx.stroke();
    }
  }
};

Chart.plugins.register(crosshairPlugin);

export default {
  name: 'LayerChart',
  props: {
    data: {
      type: Array,
      required: true
    },
    range: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      chart: null,
    };
  },
  computed: {
    chartData() {
      const sortedData = [...this.data].sort((a, b) => a.timestamp - b.timestamp);
      return {
        labels: sortedData.map(entry => new Date(parseInt(entry.timestamp))),
        datasets: [
          {
            label: 'Price',
            borderColor: '#FD627A',
            data: sortedData.map(entry => parseFloat(entry.value)),
            fill: true,
            lineTension: 0.1
          }
        ]
      };
    }
  },
  mounted() {
    this.createChart();
  },
  methods: {
    createGradient(ctx, chartArea) {
      const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
      gradient.addColorStop(0, 'rgba(253, 98, 122, 0)');
      gradient.addColorStop(0.5, 'rgba(253, 98, 122, 0.1)');
      gradient.addColorStop(1, 'rgba(253, 98, 122, 0.2)');
      return gradient;
    },
    createChart() {
      const ctx = this.$refs.chart.getContext('2d');
      const data = this.chartData;

      this.chart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: this.getChartOptions()
      });

      this.$nextTick(() => {
        this.updateGradient();
        this.setInitialZoom();
      });
    },
    getChartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        legend: { display: false },
        tooltips: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (tooltipItem, data) => {
              const dataIndex = tooltipItem.index;
              const value = data.datasets[0].data[dataIndex];
              const timestamp = this.data[dataIndex].timestamp;
              const sender = this.data[dataIndex].sender;
              return [
                `Time: ${new Date(parseInt(timestamp)).toLocaleString()}`,
                `Price: $${value.toFixed(2)}`,
                `Sender: ${sender.substr(0, 6)}...${sender.substr(-4)}`
              ];
            }
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
            ticks: { 
              source: 'data',
              autoSkip: true,
              maxTicksLimit: 10
            }
          }],
          yAxes: [{
            ticks: {
              beginAtZero: false,
              callback: value => '$' + value.toFixed(2)
            }
          }]
        },
        plugins: {
          zoom: {
            pan: {
              enabled: true,
              mode: 'x',
              onPan: this.handlePan,
              rangeMin: {
                x: null
              },
              rangeMax: {
                x: null
              }
            },
            zoom: {
              enabled: true,
              mode: 'x',
              sensitivity: 3,
              speed: 0.1,
              rangeMin: {
                x: null
              },
              rangeMax: {
                x: null
              }
            }
          }
        }
      };
    },
    handlePan({ chart }) {
      const xScale = chart.scales['x-axis-0'];
      const dataRange = this.getDataRange();

      if (xScale.min < dataRange.min) {
        xScale.min = dataRange.min;
        xScale.max = new Date(xScale.max.getTime() + (dataRange.min.getTime() - xScale.min.getTime()));
      } else if (xScale.max > dataRange.max) {
        xScale.max = dataRange.max;
        xScale.min = new Date(xScale.min.getTime() - (xScale.max.getTime() - dataRange.max.getTime()));
      }

      chart.update({ duration: 0 });
    },
    getDataRange() {
      const labels = this.chartData.labels;
      return {
        min: labels[0],
        max: labels[labels.length - 1]
      };
    },
    setInitialZoom() {
      if (this.chart && this.chartData.labels.length > 0) {
        const xScale = this.chart.scales['x-axis-0'];
        const yScale = this.chart.scales['y-axis-0'];
        const dataRange = this.getDataRange();

        // Set x-axis range
        xScale.options.ticks.min = dataRange.min;
        xScale.options.ticks.max = dataRange.max;

        // Set zoom/pan limits
        this.chart.options.plugins.zoom.pan.rangeMin.x = dataRange.min;
        this.chart.options.plugins.zoom.pan.rangeMax.x = dataRange.max;
        this.chart.options.plugins.zoom.zoom.rangeMin.x = dataRange.min;
        this.chart.options.plugins.zoom.zoom.rangeMax.x = dataRange.max;

        // Set y-axis range
        const allData = this.chartData.datasets[0].data;
        const minValue = Math.max(0, Math.min(...allData));
        const maxValue = Math.max(...allData);
        const padding = (maxValue - minValue) * 0.1;

        yScale.options.ticks.min = minValue;
        yScale.options.ticks.max = maxValue + padding;

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
    resetZoom() {
      if (this.chart) {
        this.chart.resetZoom();
        this.setInitialZoom();
      }
    },
    getTimeUnit() {
      switch (this.range) {
        case '1d': return 'hour';
        case '1w': return 'day';
        case '1m': default: return 'week';
      }
    },
    updateChart() {
      if (this.chart) {
        this.chart.data = this.chartData;
        this.chart.options = this.getChartOptions();
        this.resetZoom();
        this.updateGradient();
      }
    }
  },
  watch: {
    data: { 
      handler: 'updateChart', 
      deep: true 
    },
    range: 'updateChart'
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
    height: 100%;
    max-height: calc(100vh - 300px);
    width: 100%;
    position: relative;
    cursor: grab;
    &:active {
      cursor: grabbing;
    }
  }
  .reset-zoom-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 5px 10px;
    background-color: #fd627a;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .reset-zoom-btn:hover {
    background-color: #e5556d;
  }
</style>
