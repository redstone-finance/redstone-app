<script>
  import Chart from "chart.js";
import { generateChart } from "vue-chartjs";

Chart.defaults.LineWithLine = Chart.defaults.line;
Chart.controllers.LineWithLine = Chart.controllers.line.extend({
  draw: function (ease) {
    Chart.controllers.line.prototype.draw.call(this, ease);

    if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
      var activePoint = this.chart.tooltip._active[0],
        ctx = this.chart.ctx,
        x = activePoint.tooltipPosition().x,
        y = activePoint.tooltipPosition().y,
        topY = this.chart.scales["y-axis-0"].top,
        bottomY = this.chart.scales["y-axis-0"].bottom;

      // draw line
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.lineTo(x, bottomY);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#ababab";
      ctx.stroke();

      // draw point
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  },
});

const CustomLine = generateChart("custom-line", "LineWithLine");

export default {
  extends: CustomLine,
  props: {
    symbol: String,
    data: Object,
    decimals: Number,
    isUsdBased: Boolean,
  },
  methods: {
    createGradient(ctx, chartArea) {
      const gradient = ctx.createLinearGradient(
        0,
        chartArea.bottom,
        0,
        chartArea.top
      );
      gradient.addColorStop(0, "rgba(253, 98, 122, 0)");
      gradient.addColorStop(0.5, "rgba(253, 98, 122, 0.1)");
      gradient.addColorStop(1, "rgba(253, 98, 122, 0.2)");
      return gradient;
    },
  },
  watch: {
    data: function (chartData) {
      this.renderChart(
        {
          labels: chartData.labels,
          datasets: chartData.datasets.map(dataset => ({
            ...dataset,
            backgroundColor: (context) => {
              const chart = context.chart;
              const { ctx, chartArea } = chart;
              if (!chartArea) {
                return null;
              }
              return this.createGradient(ctx, chartArea);
            },
          })),
        },
        {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 0,
          },
          scales: {
            xAxes: [
              {
                type: "time",
                time: {
                  unit: chartData.timeUnit || "day",
                  unitStepSize: chartData.timeUnit == "minute" ? 5 : 1,
                },
                ticks: {
                  stepSize: 12,
                },
              },
            ],
            yAxes: [
              {
                ticks: {
                  userCallback: (value) => {
                    const valueCalculated = value.toFixed(chartData.decimals);
                    return this.isUsdBased
                      ? `$${valueCalculated}`
                      : valueCalculated;
                  },
                },
              },
            ],
          },
          legend: {
            display: false,
          },
          hover: {
            intersect: false,
            mode: "index",
          },
          tooltips: {
            intersect: false,
            mode: "index",
            backgroundColor: "#242F51",
            callbacks: {
              label: (tooltipItem, data) => {
                var label =
                  data.datasets[tooltipItem.datasetIndex].label || "";

                if (label) {
                  label += ": ";
                }
                const valueCalculated = tooltipItem.yLabel.toFixed(
                  chartData.decimals
                );
                label += valueCalculated;
                return this.isUsdBased ? `$${label}` : label;
              },
            },
          },
        }
      );
    },
  },
};
</script>
