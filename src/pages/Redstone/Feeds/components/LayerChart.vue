<template>
  <div class="chart-container">
    <div class="chart-controls">
      <b-button
        variant="danger"
        v-for="range in ranges"
        :key="range.value"
        size="sm"
        v-if="!duplicatedRanges.includes(range.value)"
        @click="onRangeChange(range.value)"
        :class="['range-button', { active: selectedRange === range.value }]"
      >
        {{ range.label }}
      </b-button>
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
      currency: {
        type: String,
        required: true,
      },
      data: {
        type: Array,
        required: true,
      },
      range: {
        type: String,
        required: true,
      },
      duplicatedRanges: {
        type: Array,
        required: true,
      },
    },
    data() {
      return {
        chart: null,
        selectedRange: this.range,
        ranges: [
          { value: "1d", label: "1D" },
          { value: "1w", label: "1W" },
          { value: "1m", label: "1M" },
        ],
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
        return new Date(NaN);
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

        Chart.Tooltip.positioners.custom = function (elements, position) {
          if (!elements.length) {
            return false;
          }
          const offset = 20;
          const x = position.x;
          const y = position.y;
          return {
            x: x,
            y: y - offset,
          };
        };

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
        const padding = range * 0.1;

        return {
          responsive: true,
          maintainAspectRatio: false,
          legend: { display: false },
          tooltips: {
            mode: "index",
            intersect: false,
            position: "custom",
            // Styling
            bodyFontSize: 14,
            bodyFontStyle: "normal",
            bodyFontColor: "#404040",
            backgroundColor: "rgba(254, 254, 254, 1)",
            borderColor: '#fd627a',
            borderWidth: 1,
            titleFontSize: 14,
            titleFontStyle: "bold",
            titleFontColor: "#404040",
            xPadding: 15,
            yPadding: 15,
            caretSize: 0,
            cornerRadius: 15,
            // End styling
            callbacks: {
              label: (tooltipItem, data) => {
                const value = tooltipItem.yLabel;
                return `  Answer: ${this.currency} ${value.toFixed(5)}`;
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
            point: {
              radius: 0,
              hitRadius: 10,
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
                  display: false,
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
          layout: {
            padding: {
              right: 20,
            },
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
      onRangeChange(range) {
        this.$emit("range-change", range);
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

<style scoped lang="scss">
  .chart-container {
    height: 500px;
    width: calc(100%);
    position: relative;
    margin-bottom: 40px;
    padding: 0 20px;
  }
  .chart-controls {
    position: absolute;
    right: 10px;
    top: 10px;
    padding: 8px;
    border-radius: 10px;
    background: #f5f5f5;
  }
  .range-button {
    padding: 8px 15px;
    font-size: 12px;
    margin-right: 10px;
    background: #fff;
    color: var(--redstone-red-color);
    &:last-child {
      margin-right: 0;
    }
    &.active {
      background: var(--redstone-red-color);
      color: #fff;
    }
  }
</style>