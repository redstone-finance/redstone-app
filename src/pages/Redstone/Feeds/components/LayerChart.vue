<template>
  <div class="chart-container">
    <canvas ref="chart"></canvas>
  </div>
</template>

<script>
  import Chart from "chart.js";
  const crosshairPlugin = {
    afterDatasetsDraw: function (chart) {
      if (chart.tooltip._active && chart.tooltip._active.length) {
        var activePoint = chart.tooltip._active[0],
          ctx = chart.ctx,
          x = activePoint.tooltipPosition().x,
          y = activePoint.tooltipPosition().y,
          topY = chart.scales["y-axis-0"].top,
          bottomY = chart.scales["y-axis-0"].bottom,
          leftX = chart.scales["x-axis-0"].left,
          rightX = chart.scales["x-axis-0"].right;

        // Set the line color
        ctx.strokeStyle = "rgba(253, 98, 122, 0.75)"; // Using the specified color with 75% opacity

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
    },
  };

  Chart.pluginService.register(crosshairPlugin);

  export default {
    name: "LayerChart",
    props: {
      data: {
        type: Array,
        required: true,
      },
    },
    data() {
      return {
        chart: null,
      };
    },
    computed: {
      chartData() {
        const dateCounts = this.data.reduce((acc, entry) => {
          const date = entry.timeStamp.split(" ")[0];
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});

        return {
          labels: Object.keys(dateCounts),
          datasets: [
            {
              label: "Number of actions",
              borderColor: "#FD627A",
              data: Object.values(dateCounts),
              fill: true,
              lineTension: 0.1,
            },
          ],
        };
      },
    },
    mounted() {
      this.createChart();
    },
    methods: {
      createGradient(ctx, chartArea) {
        const gradient = ctx.createLinearGradient(
          0,
          chartArea.top,
          0,
          chartArea.bottom
        );
        gradient.addColorStop(0, "rgba(253, 98, 122, 0.1)"); // Start color (top)
        gradient.addColorStop(0.8, "rgba(253, 98, 122, 0)"); // End color (80% from top)
        gradient.addColorStop(1, "rgba(253, 98, 122, 0)"); // Ensure it stays transparent to the bottom
        return gradient;
      },
      createChart() {
        const ctx = this.$refs.chart.getContext("2d");

        this.chart = new Chart(ctx, {
          type: "line",
          data: {
            labels: this.chartData.labels,
            datasets: [
              {
                ...this.chartData.datasets[0],
                backgroundColor: (context) => {
                  const chart = context.chart;
                  const { ctx, chartArea } = chart;
                  if (!chartArea) {
                    // This case happens on initial chart load
                    return null;
                  }
                  return this.createGradient(ctx, chartArea);
                },
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
              display: false,
            },
            tooltips: {
              mode: "index",
              intersect: false,
              position: "nearest",
            },
            hover: {
              mode: "index",
              intersect: false,
            },
            layout: {
              padding: {
                bottom: 20, // Add padding to the bottom of the chart
              },
            },
            scales: {
              xAxes: [
                {
                  type: "category",
                  display: true,
                  gridLines: {
                    display: false,
                    drawBorder: true,
                    drawOnChartArea: false,
                  },
                  ticks: {
                    display: true,
                    padding: 20, // Move labels 20px down
                  },
                },
              ],
              yAxes: [
                {
                  display: true,
                  ticks: {
                    beginAtZero: true,
                  },
                  gridLines: {
                    display: true,
                  },
                },
              ],
            },
          },
        });
      },
    },
    watch: {
      data: {
        handler() {
          if (this.chart) {
            this.chart.data.labels = this.chartData.labels;
            this.chart.data.datasets[0].data = this.chartData.datasets[0].data;
            this.chart.update();
          }
        },
        deep: true,
      },
    },
    beforeDestroy() {
      if (this.chart) {
        this.chart.destroy();
      }
    },
  };
</script>

<style scoped>
  .chart-container {
  height: 100%;
  width: 100%;
}
</style>
