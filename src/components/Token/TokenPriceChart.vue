<script>
  import Chart from "chart.js";
  import { generateChart } from "vue-chartjs";

  const CustomLine = generateChart("line", "line");

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
            datasets: chartData.datasets.map((dataset, index) => ({
              ...dataset,
              backgroundColor:
                index === 0
                  ? (context) => {
                      const chart = context.chart;
                      const { ctx, chartArea } = chart;
                      if (!chartArea) {
                        return null;
                      }
                      return this.createGradient(ctx, chartArea);
                    }
                  : "transparent", // Set background to transparent for all datasets except the first
              fill: index === 0, // Only fill the first dataset
            })),
          },
          {
            responsive: true,
            maintainAspectRatio: false,
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
                  gridLines: {
                    lineWidth: 0,
                    drawOnChartArea: false,
                    drawTicks: false,
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
            tooltips: {
              enabled: true,
              mode: "index",
              intersect: false,
              bodyFontSize: 14,
              bodyFontStyle: "normal",
              bodyFontColor: "#404040",
              backgroundColor: "rgba(254, 254, 254, 1)",
              borderColor: "#fd627a",
              borderWidth: 1,
              titleFontSize: 14,
              titleFontStyle: "bold",
              titleFontColor: "#404040",
              xPadding: 15,
              yPadding: 15,
              caretSize: 0,
              cornerRadius: 15,
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
            hover: {
              mode: "index",
              intersect: false,
            },
            elements: {
              line: {
                borderWidth: 2,
              },
              point: {
                radius: 0,
                hitRadius: 10,
                hoverRadius: 5,
              },
            },
            animation: {
              duration: 0,
            },
          }
        );
      },
    },
  };
</script>
