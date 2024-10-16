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
        :class="[
          'range-button',
          { active: selectedRange === range.value && !isZoomed },
        ]"
      >
        {{ range.label }}
      </b-button>
    </div>
    <canvas ref="chart"></canvas>
  </div>
</template>

<script>
  import Chart from "chart.js";
  import {
    isValid,
    subDays,
    subMonths,
    parseISO,
    differenceInMinutes,
    differenceInHours,
    differenceInDays,
    startOfMinute,
    startOfHour,
    startOfDay,
  } from "date-fns";
  import isScreen from "../../../../core/screenHelper";
  import {
    currencySymbolMap,
    formatPriceWithoutCurrency,
  } from "./../utils/FeedsTableDataLayer";
  import zoomPlugin from "chartjs-plugin-zoom";

  Chart.plugins.register(zoomPlugin);

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
      denomination: {
        type: String,
        required: true,
      },
      specialDenomination: {
        type: Boolean,
        default: false,
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
        isMobile: false,
        isZoomed: false,
        zoomedStartDate: null,
        zoomedEndDate: null,
      };
    },
    computed: {
      maxDataPoints() {
        const now = new Date();
        let startDate;
        if (this.isZoomed && this.zoomedStartDate && this.zoomedEndDate) {
          const diffInMinutes = differenceInMinutes(
            this.zoomedEndDate,
            this.zoomedStartDate
          );
          return diffInMinutes <= 1440
            ? diffInMinutes
            : Math.ceil(diffInMinutes / 10);
        } else {
          switch (this.selectedRange) {
            case "1d":
              startDate = subDays(now, 1);
              return Math.ceil(differenceInMinutes(now, startDate) / 10); // Every 10 minutes for 1 day
            case "1w":
              startDate = subDays(now, 7);
              return differenceInHours(now, startDate); // Every hour for 1 week
            case "1m":
              startDate = subMonths(now, 1);
              return Math.ceil(differenceInHours(now, startDate) / 6); // Every 6 hours for 1 month
            default:
              startDate = subDays(now, 7);
              return differenceInHours(now, startDate); // Default to 1 week with hourly intervals
          }
        }
      },
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

        let processedData = this.processDataForRange(
          sortedData,
          this.selectedRange
        );

        // Apply zoom filter if active
        if (this.isZoomed && this.zoomedStartDate && this.zoomedEndDate) {
          processedData = processedData.filter((entry) => {
            const entryDate = this.parseTimestamp(entry.timestamp);
            return (
              entryDate >= this.zoomedStartDate &&
              entryDate <= this.zoomedEndDate
            );
          });
        }

        return {
          labels: processedData.map((entry) => new Date(entry.timestamp)),
          datasets: [
            {
              label: "Price",
              borderColor: "#FD627A",
              data: processedData.map((entry) => ({
                x: new Date(entry.timestamp),
                y: parseFloat(entry.value),
              })),
              fill: true,
              lineTension: 0.1,
              pointRadius: 3,
              pointHoverRadius: 5,
            },
          ],
        };
      },
    },
    mounted() {
      this.checkMobileView();
      this.createChart();
    },
    methods: {
      onDataPointClick(index) {
        this.$emit("data-point-click", index);
      },
      processDataForRange(data, range) {
        const now = new Date();
        let startDate;
        let interval;

        if (this.isZoomed && this.zoomedStartDate && this.zoomedEndDate) {
          startDate = this.zoomedStartDate;
          const diffInMinutes = differenceInMinutes(
            this.zoomedEndDate,
            this.zoomedStartDate
          );
          interval = diffInMinutes <= 1440 ? "minute" : "10minutes";
        } else {
          switch (range) {
            case "1d":
              startDate = subDays(now, 1);
              interval = "10minutes";
              break;
            case "1w":
              startDate = subDays(now, 7);
              interval = "hour";
              break;
            case "1m":
              startDate = subMonths(now, 1);
              interval = "6hours";
              break;
            default:
              startDate = subDays(now, 7);
              interval = "hour";
          }
        }

        return this.selectDataPoints(data, startDate, now, interval);
      },

      selectDataPoints(data, startDate, endDate, interval) {
        let filteredData = data.filter((entry) => {
          const entryDate = this.parseTimestamp(entry.timestamp);
          return entryDate >= startDate && entryDate <= endDate;
        });

        let groupedData = {};

        filteredData.forEach((entry) => {
          const entryDate = this.parseTimestamp(entry.timestamp);
          let key;

          switch (interval) {
            case "minute":
              key = startOfMinute(entryDate).getTime();
              break;
            case "10minutes":
              key = startOfMinute(entryDate).getTime();
              key = key - (key % (10 * 60 * 1000));
              break;
            case "hour":
              key = startOfHour(entryDate).getTime();
              break;
            case "6hours":
              key = startOfHour(entryDate).getTime();
              key = key - (key % (6 * 60 * 60 * 1000));
              break;
            case "day":
              key = startOfDay(entryDate).getTime();
              break;
          }

          if (
            !groupedData[key] ||
            entryDate > this.parseTimestamp(groupedData[key].timestamp)
          ) {
            groupedData[key] = entry;
          }
        });

        return Object.values(groupedData).sort(
          (a, b) =>
            this.parseTimestamp(a.timestamp) - this.parseTimestamp(b.timestamp)
        );
      },

      selectMeaningfulPoints(data, startDate, endDate, interval) {
        let filteredData = data.filter((entry) => {
          const entryDate = this.parseTimestamp(entry.timestamp);
          return entryDate >= startDate && entryDate <= endDate;
        });

        let groupedData = {};

        filteredData.forEach((entry) => {
          const entryDate = this.parseTimestamp(entry.timestamp);
          let key;

          switch (interval) {
            case "hour":
              key = startOfHour(entryDate).getTime();
              break;
            case "12hours":
              key = startOfHour(entryDate).getTime();
              key = key - (key % (12 * 60 * 60 * 1000));
              break;
            case "day":
              key = startOfDay(entryDate).getTime();
              break;
          }

          if (
            !groupedData[key] ||
            parseFloat(entry.value) > parseFloat(groupedData[key].value)
          ) {
            groupedData[key] = entry;
          }
        });

        return Object.values(groupedData).sort(
          (a, b) =>
            this.parseTimestamp(a.timestamp) - this.parseTimestamp(b.timestamp)
        );
      },
      getRangeInMinutes() {
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
            startDate = subDays(now, 1);
        }
        return differenceInMinutes(now, startDate);
      },

      shouldClusterData(data) {
        if (this.isZoomed) {
          const zoomDuration = differenceInMinutes(
            this.zoomedEndDate,
            this.zoomedStartDate
          );
          return data.length > Math.min(zoomDuration, 24 * 60);
        }
        return data.length > this.maxDataPoints;
      },
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
      clusterData(data) {
        if (data.length <= this.maxDataPoints) {
          return data;
        }

        const factor = Math.ceil(data.length / this.maxDataPoints);
        const clusteredData = [];

        for (let i = 0; i < data.length; i += factor) {
          const cluster = data.slice(i, i + factor);
          const avgTimestamp = new Date(
            cluster.reduce(
              (sum, point) =>
                sum + this.parseTimestamp(point.timestamp).getTime(),
              0
            ) / cluster.length
          );
          const avgValue =
            cluster.reduce((sum, point) => sum + parseFloat(point.value), 0) /
            cluster.length;

          clusteredData.push({
            timestamp: avgTimestamp,
            value: avgValue.toFixed(5),
          });
        }

        return clusteredData;
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

        // Add click event listener to the chart
        this.$refs.chart.onclick = (evt) => {
          const activePoints = this.chart.getElementsAtEventForMode(
            evt,
            "nearest",
            { intersect: false },
            false
          );
          this.onDataPointClick(activePoints[0]._index);
        };
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
                const value = tooltipItem.yLabel;
                return `  Answer: ${this.currency} ${formatPriceWithoutCurrency(value, this.specialDenomination)}`;
              },
            },
            filter: function (tooltipItem, data) {
              return tooltipItem.datasetIndex === 0;
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
              radius: 3,
              hitRadius: 10,
              hoverRadius: 5,
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
                  maxRotation: 0,
                  minRotation: 0,
                },
              },
            ],
            yAxes: [
              {
                ticks: {
                  beginAtZero: false,
                  suggestedMin: minValue - padding,
                  suggestedMax: maxValue + padding,
                  callback: (value) => {
                    return `${currencySymbolMap[this.denomination] || this.denomination} ${formatPriceWithoutCurrency(value, this.specialDenomination)}`;
                  },
                  maxRotation: 0,
                  minRotation: 0,
                },
                gridLines: {
                  display: true,
                  color: "rgba(0, 0, 0, 0.1)",
                },
              },
            ],
          },
          layout: {
            padding: {
              left: 10,
              right: 30,
              top: 10,
              bottom: 10,
            },
          },
          plugins: {
            zoom: {
              pan: {
                enabled: false,
                mode: "x",
                onPan: () => this.enforceZoomLimits(),
              },
              zoom: {
                enabled: true,
                mode: "x",
                drag: {
                  enabled: true,
                  borderColor: "rgba(253, 98, 122, 0.4)",
                  borderWidth: 1,
                  backgroundColor: "rgba(253, 98, 122, 0.2)",
                  threshold: 5,
                },
                onZoomComplete: (chart) => {
                  this.enforceZoomLimits();
                },
              },
            },
          },
          onClick: (event, activeElements) => {
            if (activeElements.length > 0) {
              const index = activeElements[0]._index;
              this.onDataPointClick(index);
            }
          },
          onHover: (event, chartElements) => {
            if (chartElements.length === 0) {
              this.chart.canvas.style.cursor = "default";
            } else {
              this.chart.canvas.style.cursor = "pointer";
            }
          },
        };
      },
      enforceZoomLimits() {
        if (!this.chart) return;

        const { min, max } = this.chart.scales["x-axis-0"];
        const data = this.chart.data.datasets[0].data;

        // Sort data by x value
        const sortedData = data.slice().sort((a, b) => a.x - b.x);

        // Always ensure at least 2 points are visible
        const minVisiblePoints = 2;

        let newMin = min;
        let newMax = max;

        // Find the indices of the visible points
        let startIndex = sortedData.findIndex((point) => point.x >= newMin);
        let endIndex = sortedData.findIndex((point) => point.x > newMax) - 1;

        // If endIndex is -1 (not found), set it to the last index
        if (endIndex === -2) endIndex = sortedData.length - 1;

        // Ensure at least 2 points are visible
        if (endIndex - startIndex < minVisiblePoints - 1) {
          if (startIndex + minVisiblePoints <= sortedData.length) {
            // Expand to the right
            endIndex = startIndex + minVisiblePoints - 1;
          } else {
            // Expand to the left
            startIndex = sortedData.length - minVisiblePoints;
            endIndex = sortedData.length - 1;
          }
        }

        newMin = sortedData[startIndex].x;
        newMax = sortedData[endIndex].x;

        // Update the chart scales
        this.chart.scales["x-axis-0"].options.ticks.min = newMin;
        this.chart.scales["x-axis-0"].options.ticks.max = newMax;

        this.chart.update();

        // Update component data
        this.zoomedStartDate = new Date(newMin);
        this.zoomedEndDate = new Date(newMax);
        this.isZoomed = true;
        this.onZoomComplete();
      },
      handleZoom(chart) {
        const { min, max } = chart.scales["x-axis-0"];
        this.zoomedStartDate = new Date(min);
        this.zoomedEndDate = new Date(max);
        this.isZoomed = true;
        this.updateChart();
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
        if (this.isZoomed && this.zoomedStartDate && this.zoomedEndDate) {
          const diffInDays = differenceInDays(
            this.zoomedEndDate,
            this.zoomedStartDate
          );
          if (diffInDays <= 1) return "hour";
          if (diffInDays <= 7) return "day";
          return "week";
        } else {
          switch (this.selectedRange) {
            case "1d":
              return "hour";
            case "1w":
              return "day";
            case "1m":
              return "day"; // Changed from "week" to "day" for more granular display
            default:
              return "day";
          }
        }
      },
      updateChart() {
        if (this.chart) {
          const newData = this.chartData;
          this.chart.data = newData;
          this.chart.options = this.getChartOptions();
          this.updateGradient();
          this.chart.update({
            duration: 0,
            lazy: false,
            preservation: true,
          });
        }
      },
      onRangeChange(range) {
        this.selectedRange = range;
        this.isZoomed = false;
        this.zoomedStartDate = null;
        this.zoomedEndDate = null;
        this.chart.resetZoom();
        this.$emit("range-change", range);
        this.updateChart();
      },
      checkMobileView() {
        this.isMobile = isScreen("xs") || isScreen("sm");
      },
      onZoomComplete() {
        this.isZoomed = true;
        const { min, max } = this.chart.scales["x-axis-0"];
        this.zoomedStartDate = new Date(min);
        this.zoomedEndDate = new Date(max);
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

<style scoped lang="scss">
  .chart-container {
    position: relative;
    margin-bottom: 40px;
    padding: 0 20px;
    max-height: 500px;
  }
  canvas {
    height: 500px;
    width: 100%;
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

  @media (max-width: 768px) {
    .chart-container {
      padding-top: 60px;
    }
    .chart-controls {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      background: transparent;
      display: flex;
      justify-content: center;
      padding: 10px 0;
    }
    canvas {
      height: 300px;
    }
  }
</style>
