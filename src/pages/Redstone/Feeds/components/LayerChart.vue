<template>
  <div class="chart-container">
    <canvas ref="chart"></canvas>
    <button class="reset-zoom-btn" @click="resetZoom">Reset Zoom</button>
  </div>
</template>

<script>
import Chart from "chart.js";
import ChartZoom from "chartjs-plugin-zoom";
import { format, isSameDay, parseISO } from "date-fns";

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

      // Draw crosshair
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.lineTo(x, bottomY);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(253, 98, 122, 0.75)";
      ctx.setLineDash([6, 6]);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(leftX, y);
      ctx.lineTo(rightX, y);
      ctx.stroke();
      ctx.restore();

      // Draw point
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(253, 98, 122, 1)";
      ctx.fill();
      ctx.restore();
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
            lineTension: 0.1,
            pointRadius: 0,
            pointHoverRadius: 0,
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
                `Time: ${format(new Date(parseInt(timestamp)), 'PPpp')}`,
                `Price: $${value.toFixed(2)}`,
                `Sender: ${sender.substr(0, 6)}...${sender.substr(-4)}`
              ];
            }
          }
        },
        hover: {
          mode: 'index',
          intersect: false,
        },
        elements: {
          line: {
            borderWidth: 1
          }
        },
        scales: {
          xAxes: [{
            type: 'time',
            time: { 
              unit: this.getTimeUnit(),
              displayFormats: {
                millisecond: 'HH:mm:ss.SSS',
                second: 'HH:mm:ss',
                minute: 'HH:mm',
                hour: 'HH:mm',
                day: 'MMM d',
                week: 'MMM d',
                month: 'MMM yyyy'
              },
              tooltipFormat: 'PPpp'
            },
            ticks: { 
              source: 'data',
              autoSkip: true,
              maxTicksLimit: 10,
              callback: (value, index, values) => {
                const date = new Date(value);
                if (index === 0 || !isSameDay(date, new Date(values[index - 1]))) {
                  return format(date, 'MMM d, HH:mm');
                }
                return format(date, 'HH:mm');
              }
            },
            gridLines: {
              display: false,
              drawBorder: false,
            }
          }],
          yAxes: [{
            ticks: {
              beginAtZero: false,
              callback: value => '$' + value.toFixed(2)
            },
            gridLines: {
              color: 'rgba(0, 0, 0, 0.1)',
              zeroLineColor: 'rgba(0, 0, 0, 0.25)',
              drawBorder: false
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
              },
              onZoom: this.handleZoom
            }
          }
        }
      };
    },
    handlePan({ chart }) {
      this.updateAxisDisplay(chart);
      const xScale = chart.scales['x-axis-0'];
      const yScale = chart.scales['y-axis-0'];
      const dataRange = this.getDataRange();

      if (xScale.min < dataRange.min) {
        xScale.min = dataRange.min;
        xScale.max = new Date(xScale.max.getTime() + (dataRange.min.getTime() - xScale.min.getTime()));
      } else if (xScale.max > dataRange.max) {
        xScale.max = dataRange.max;
        xScale.min = new Date(xScale.min.getTime() - (xScale.max.getTime() - dataRange.max.getTime()));
      }

      const visibleData = this.getVisibleData(chart);
      this.updateYAxisRange(yScale, visibleData);
      this.updateTimeUnit(chart);

      chart.update({ duration: 0 });
    },
    handleZoom({ chart }) {
      this.updateAxisDisplay(chart);
      const yScale = chart.scales['y-axis-0'];
      const visibleData = this.getVisibleData(chart);
      this.updateYAxisRange(yScale, visibleData);
      this.updateTimeUnit(chart);
      chart.update({ duration: 0 });
    },
    updateAxisDisplay(chart) {
      const xAxis = chart.scales['x-axis-0'];
      xAxis.options.gridLines.display = false;
      xAxis.options.gridLines.drawBorder = false;
    },
    getDataRange() {
      const labels = this.chartData.labels;
      return {
        min: labels[0],
        max: labels[labels.length - 1]
      };
    },
    getVisibleData(chart) {
      const xScale = chart.scales['x-axis-0'];
      const dataset = chart.data.datasets[0];
      return dataset.data.filter((_, index) => {
        const dataPoint = chart.data.labels[index];
        return dataPoint >= xScale.min && dataPoint <= xScale.max;
      });
    },
    updateYAxisRange(yScale, data) {
      const minValue = Math.max(0, Math.min(...data));
      const maxValue = Math.max(...data);
      const valueRange = maxValue - minValue;
      const topPadding = valueRange * 0.4;
      const bottomPadding = valueRange * 0.1;

      yScale.options.ticks.min = minValue - bottomPadding;
      yScale.options.ticks.max = maxValue + topPadding;
    },
    updateTimeUnit(chart) {
      const xAxis = chart.scales['x-axis-0'];
      const range = xAxis.max - xAxis.min;
      const rangeInDays = range / (1000 * 60 * 60 * 24);

      if (rangeInDays <= 1) {
        xAxis.options.time.unit = 'hour';
      } else if (rangeInDays <= 7) {
        xAxis.options.time.unit = 'day';
      } else if (rangeInDays <= 30) {
        xAxis.options.time.unit = 'week';
      } else {
        xAxis.options.time.unit = 'month';
      }
    },
    setInitialZoom() {
      if (this.chart && this.chartData.labels.length > 0) {
        const xScale = this.chart.scales['x-axis-0'];
        const yScale = this.chart.scales['y-axis-0'];
        const dataRange = this.getDataRange();

        xScale.options.ticks.min = dataRange.min;
        xScale.options.ticks.max = dataRange.max;

        this.chart.options.plugins.zoom.pan.rangeMin.x = dataRange.min;
        this.chart.options.plugins.zoom.pan.rangeMax.x = dataRange.max;
        this.chart.options.plugins.zoom.zoom.rangeMin.x = dataRange.min;
        this.chart.options.plugins.zoom.zoom.rangeMax.x = dataRange.max;

        this.updateYAxisRange(yScale, this.chartData.datasets[0].data);
        this.updateAxisDisplay(this.chart);
        this.updateTimeUnit(this.chart);
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
