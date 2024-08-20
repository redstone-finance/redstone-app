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
import {
  format,
  isSameDay,
  parseISO,
  subDays,
  subMonths,
  isValid,
  startOfDay,
  differenceInDays,
  differenceInHours,
} from "date-fns";

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
        .sort((a, b) => a.timestamp - b.timestamp)
        .filter((entry) => {
          const date = new Date(entry.timestamp);
          return isValid(date) && !isNaN(parseFloat(entry.value));
        });
      const filteredData = this.filterDataByRange(sortedData);

      return {
        labels: filteredData.map((entry) => new Date(entry.timestamp)),
        datasets: [
          {
            label: "Price",
            borderColor: "#FD627A",
            data: filteredData.map((entry) => parseFloat(entry.value)),
            fill: true,
            lineTension: 0.1,
            pointRadius: 0,
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
    filterDataByRange(data) {
      const now = new Date();
      let startDate;
      switch (this.selectedRange) {
        case "1d":
          startDate = subDays(startOfDay(now), 1);
          break;
        case "1w":
          startDate = subDays(startOfDay(now), 7);
          break;
        case "1m":
          startDate = subMonths(startOfDay(now), 1);
          break;
        default:
          return data;
      }
      return data.filter((entry) => {
        const entryDate = new Date(parseInt(entry.timestamp));
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
      return {
        responsive: true,
        maintainAspectRatio: false,
        legend: { display: false },
        tooltips: {
          mode: "index",
          intersect: false,
          callbacks: {
            label: (tooltipItem, data) => {
              const dataIndex = tooltipItem.index;
              const value = data.datasets[0].data[dataIndex];
              const timestamp = this.chartData.labels[dataIndex];
              const sender = this.data.find(
                (d) =>
                  d &&
                  d.timestamp &&
                  parseInt(d.timestamp) === timestamp.getTime()
              )?.sender;
              return [
                `Time: ${this.formatDate(timestamp)}`,
                `Price: $${value.toFixed(5)}`,
                `Sender: ${sender ? sender.substr(0, 6) + "..." + sender.substr(-4) : "N/A"}`,
              ];
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
        scales: {
          xAxes: [
            {
              type: "time",
              time: {
                unit: this.getTimeUnit(),
                displayFormats: {
                  millisecond: "HH:mm:ss.SSS",
                  second: "HH:mm:ss",
                  minute: "HH:mm",
                  hour: "MMM d",
                  day: "MMM d",
                  week: "MMM d",
                  month: "MMM yyyy",
                },
                tooltipFormat: "PPpp",
              },
              ticks: {
                source: "data",
                autoSkip: true,
                maxTicksLimit: this.getMaxTicksLimit(),
                callback: (value, index, values) => {
                  const date = new Date(value);
                  return format(date, "MMM d");
                },
              },
              gridLines: {
                display: true,
                drawBorder: true,
                color: "rgba(0, 0, 0, 0.1)",
              },
            },
          ],
        },
      };
    },
    formatDate(value) {
      if (!value) return "";
      const date = new Date(value);
      if (!isValid(date)) return "";
      return format(date, "PPpp");
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
    getMaxTicksLimit() {
      switch (this.selectedRange) {
        case "1d":
          return 24;
        case "1w":
          return 7;
        case "1m":
          return 15;
        default:
          return 10;
      }
    },
    updateChart() {
      if (this.chart) {
        this.chart.data = this.chartData;
        this.chart.options = this.getChartOptions();
        this.updateGradient();
        this.chart.update();
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