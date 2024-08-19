<template>
  <div class="chart-container">
    <canvas ref="chart"></canvas>
    <button @click="resetAndRecenter" class="reset-zoom-btn">Reset Zoom</button>
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

Chart.pluginService.register(crosshairPlugin);

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
    this.$nextTick(() => {
      this.updateGradient();
    });
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
            crosshair: true,
            zoom: {
              pan: {
                enabled: true,
                mode: 'xy',
                rangeMin: {
                  x: null,
                  y: null
                },
                rangeMax: {
                  x: null,
                  y: null
                }
              },
              zoom: {
                enabled: true,
                drag: false,
                mode: 'xy',
                rangeMin: {
                  x: null,
                  y: null
                },
                rangeMax: {
                  x: null,
                  y: null
                },
                speed: 0.1,
                threshold: 2,
                sensitivity: 3
              }
            }
          }
        }
      });

      this.updateGradient();
      this.updateZoomLimits();
    },
    updateChart() {
      if (this.chart) {
        this.chart.data = this.chartData;
        this.chart.options.scales.xAxes[0].time.unit = this.getTimeUnit();
        this.updateGradient();
        this.updateZoomLimits();
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
    getTimeUnit() {
      switch (this.range) {
        case '1d':
          return 'hour';
        case '1w':
          return 'day';
        case '1m':
        default:
          return 'week';
      }
    },
    updateZoomLimits() {
      if (this.chart && this.chartData.labels.length > 0) {
        const minDate = this.chartData.labels[0];
        const maxDate = this.chartData.labels[this.chartData.labels.length - 1];
        const minValue = Math.min(...this.chartData.datasets[0].data);
        const maxValue = Math.max(...this.chartData.datasets[0].data);

        this.chart.options.plugins.zoom.pan.rangeMin = {
          x: minDate,
          y: minValue * 0.9
        };
        this.chart.options.plugins.zoom.pan.rangeMax = {
          x: maxDate,
          y: maxValue * 1.1
        };
        this.chart.options.plugins.zoom.zoom.rangeMin = {
          x: minDate,
          y: minValue * 0.9
        };
        this.chart.options.plugins.zoom.zoom.rangeMax = {
          x: maxDate,
          y: maxValue * 1.1
        };
      }
    },
    resetAndRecenter() {
      if (this.chart) {
        this.chart.resetZoom();
        
        // Recenter the chart
        const chartData = this.chartData;
        if (chartData.labels.length > 0) {
          const minDate = chartData.labels[0];
          const maxDate = chartData.labels[chartData.labels.length - 1];
          const minValue = Math.min(...chartData.datasets[0].data);
          const maxValue = Math.max(...chartData.datasets[0].data);

          this.chart.options.scales.xAxes[0].ticks.min = minDate;
          this.chart.options.scales.xAxes[0].ticks.max = maxDate;
          this.chart.options.scales.yAxes[0].ticks.min = minValue * 0.9;
          this.chart.options.scales.yAxes[0].ticks.max = maxValue * 1.1;

          this.chart.update();
        }
      }
    }
  },
  watch: {
    data: {
      handler() {
        this.updateChart();
      },
      deep: true
    },
    range() {
      this.updateChart()
      setTimeout(this.resetAndRecenter, 500)
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
  position: relative;
}
.reset-zoom-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  background-color: #FD627A;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.reset-zoom-btn:hover {
  background-color: #e5556d;
}
</style>