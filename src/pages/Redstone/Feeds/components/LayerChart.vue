<template>
  <div class="chart-container">
    <div class="chart-controls">
      <select
        v-model="selectedRange"
        @change="onRangeChange"
        class="range-dropdown"
      >
        <option value="1d">1 Day</option>
        <option value="1w">1 Week</option>
        <option value="1m">1 Month</option>
      </select>
    </div>
    <canvas ref="chart"></canvas>
  </div>
</template>

<script>
  import Chart from "chart.js";
  import { isValid, startOfDay, subDays, subMonths, parseISO } from "date-fns";

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

        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(253, 98, 122, 1)";
        ctx.fill();
        ctx.restore();
      }
    },
  };

  Chart.plugins.register(crosshairPlugin);

  export default {
    name: "LayerChart",
    props: {
      data: {
        type: Array,
        required: true,
      },
      range: {
        type: String,
        required: true,
      },
    },
    data() {
      return {
        chart: null,
        selectedRange: this.range,
      };
    },
    computed: {
      chartData() {
        const sortedData = [...this.data]
          .filter((entry) => {
            const timestamp = this.parseTimestamp(entry.timestamp);
            return isValid(timestamp) && !isNaN(parseFloat(entry.value));
          })
          .sort((a, b) => {
            const dateA = this.parseTimestamp(a.timestamp);
            const dateB = this.parseTimestamp(b.timestamp);
            return dateA.getTime() - dateB.getTime();
          });

        const filteredData = this.filterDataByRange(sortedData);

        return {
          labels: filteredData.map((entry) => new Date(entry.timestamp)),
          datasets: [
            {
              label: "Price",
              borderColor: "#FD627A",
              data: filteredData.map((entry) => ({
                x: new Date(entry.timestamp),
                y: parseFloat(entry.value),
              })),
              fill: true,
              lineTension: 0.1,
              pointRadius: 4,
              pointHoverRadius: 0,
            },
          ],
        };
      },
    },
    mounted() {
      this.createChart();
    },
    methods: {
      parseTimestamp(timestamp) {
        if (typeof timestamp === "number") {
          return new Date(timestamp);
        } else if (typeof timestamp === "string") {
          return parseISO(timestamp);
        }
        return new Date(NaN); // Invalid date
      },
      filterDataByRange(data) {
        const now = new Date();
        let startDate;
        switch (this.selectedRange) {
          case "1d":
            startDate = subDays(now, 1);
            break;
          case "1w":
            startDate = subDays(now, 7);
            break;
          case "1m":
            startDate = subMonths(now, 1);
            break;
          default:
            return data;
        }
        return data.filter((entry) => {
          const entryDate = this.parseTimestamp(entry.timestamp);
          return entryDate >= startDate && entryDate <= now;
        });
      },
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
      createChart() {
        const ctx = this.$refs.chart.getContext("2d");
        const data = this.chartData;

        this.chart = new Chart(ctx, {
          type: "line",
          data: data,
          options: this.getChartOptions(),
        });

        this.$nextTick(() => {
          this.updateGradient();
        });
      },
      getChartOptions() {
        const data = this.chartData.datasets[0].data;
        const minValue = Math.min(...data.map((point) => point.y));
        const maxValue = Math.max(...data.map((point) => point.y));
        const range = maxValue - minValue;
        const padding = range * 0.1; // 10% padding

        return {
          responsive: true,
          maintainAspectRatio: false,
          legend: { display: false },
          tooltips: {
            mode: "index",
            intersect: false,
            callbacks: {
              label: (tooltipItem, data) => {
                const value = tooltipItem.yLabel;
                return `Price: $${value.toFixed(5)}`;
              },
            },
          },
          hover: {
            mode: "index",
            intersect: false,
          },
          elements: {
            line: {
              borderWidth: 1,
            },
          },
          animation: {
            duration: 0,
          },
          scales: {
            xAxes: [
              {
                type: "time",
                time: {
                  unit: this.getTimeUnit(),
                  displayFormats: {
                    hour: "HH:mm",
                    day: "MMM D",
                    week: "MMM D",
                    month: "MMM YYYY",
                  },
                },
                gridLines: {
                  display: true,
                  drawBorder: true,
                  color: "rgba(0, 0, 0, 0.1)",
                },
                ticks: {
                  autoSkip: true,
                  maxTicksLimit: 10,
                },
              },
            ],
            yAxes: [
              {
                ticks: {
                  beginAtZero: false,
                  suggestedMin: minValue - padding,
                  suggestedMax: maxValue + padding,
                },
              },
            ],
          },
        };
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
        switch (this.selectedRange) {
          case "1d":
            return "hour";
          case "1w":
            return "day";
          case "1m":
            return "day";
          default:
            return "day";
        }
      },
      updateChart() {
        if (this.chart) {
          const newData = this.chartData;
          this.chart.data.labels = newData.labels;
          this.chart.data.datasets[0].data = newData.datasets[0].data;
          this.chart.options = this.getChartOptions();
          this.updateGradient();
          this.chart.update({
            duration: 0,
            resetTransforms: true,
          });
        }
      },
      onRangeChange() {
        this.$emit("range-change", this.selectedRange);
        this.updateChart();
      },
    },
    watch: {
      data: {
        handler: "updateChart",
        deep: true,
      },
      range: {
        handler(newRange) {
          this.selectedRange = newRange;
          this.updateChart();
        },
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
    margin-left: auto;
    height: 500px;
    width: 100%;
    position: relative;
  }
  .chart-controls {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    gap: 10px;
  }
  .range-dropdown {
    padding: 5px 10px;
    background-color: white;
    border: 1px solid #fd627a;
    border-radius: 4px;
    color: #fd627a;
    cursor: pointer;
  }
</style>
