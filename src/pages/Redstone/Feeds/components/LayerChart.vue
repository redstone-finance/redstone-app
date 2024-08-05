<template>
  <div class="chart-container">
    <canvas ref="chart"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js'

const crosshairPlugin = {
  afterDraw: function(chart) {
    if (chart.tooltip._active && chart.tooltip._active.length) {
      var activePoint = chart.tooltip._active[0],
          ctx = chart.ctx,
          x = activePoint.tooltipPosition().x,
          y = activePoint.tooltipPosition().y,
          topY = chart.scales['y-axis-0'].top,
          bottomY = chart.scales['y-axis-0'].bottom,
          leftX = chart.scales['x-axis-0'].left,
          rightX = chart.scales['x-axis-0'].right;

      // draw vertical line
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.lineTo(x, bottomY);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.setLineDash([6, 6]);
      ctx.stroke();

      // draw horizontal line
      ctx.beginPath();
      ctx.moveTo(leftX, y);
      ctx.lineTo(rightX, y);
      ctx.stroke();
      
      ctx.restore();
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
    }
  },
  data() {
    return {
      chart: null
    }
  },
  computed: {
    chartData() {
      const dateCounts = this.data.reduce((acc, entry) => {
        const date = entry.timeStamp.split(' ')[0];
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
            lineTension: 0.4
          }
        ]
      };
    }
  },
  mounted() {
    this.createChart();
  },
  methods: {
    createChart() {
      const ctx = this.$refs.chart.getContext('2d');
      this.chart = new Chart(ctx, {
        type: 'line',
        data: this.chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          tooltips: {
            mode: 'index',
            intersect: false,
          },
          hover: {
            mode: 'index',
            intersect: false
          },
          scales: {
            xAxes: [{
              type: 'category',
              display: true
            }],
            yAxes: [{
              display: true,
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }
      });
    }
  },
  watch: {
    data: {
      handler() {
        if (this.chart) {
          this.chart.data = this.chartData;
          this.chart.update();
        }
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
  height: 100%;
  width: 100%;
}
</style>