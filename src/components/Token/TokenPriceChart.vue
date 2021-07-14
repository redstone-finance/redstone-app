<script>
  import Chart from 'chart.js'
  import { generateChart } from 'vue-chartjs'

  Chart.defaults.LineWithLine = Chart.defaults.line;
  Chart.controllers.LineWithLine = Chart.controllers.line.extend({
    draw: function(ease) {
      Chart.controllers.line.prototype.draw.call(this, ease);

      if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
         var activePoint = this.chart.tooltip._active[0],
             ctx = this.chart.ctx,
             x = activePoint.tooltipPosition().x,
             topY = this.chart.scales['y-axis-0'].top,
             bottomY = this.chart.scales['y-axis-0'].bottom;

         // draw line
         ctx.save();
         ctx.beginPath();
         ctx.moveTo(x, topY);
         ctx.lineTo(x, bottomY);
         ctx.lineWidth = 1;
         ctx.strokeStyle = '#ababab';
         ctx.stroke();
         ctx.restore();
      }
   }
  })

  const CustomLine = generateChart('custom-line', 'LineWithLine')

  export default {
    extends: CustomLine,
    props: ['data'],
    watch: {
      data: function(chartData) { // watch it
        this.renderChart(
          {
            labels: chartData.labels,
            datasets: chartData.datasets,
          },
          {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              duration: 0,
            },
            scales: {
              xAxes: [{
                type: 'time',
                time: {
                  unit: chartData.timeUnit || 'day',
                  unitStepSize: 5
                },
                ticks: {
                  // forces step size to be 5 units
                  stepSize: 12 // <----- This prop sets the stepSize
                }
              }]
            },
            legend: {
              display: false
            },
            hover: {
              intersect: false,
              mode: "index",
            },
            tooltips: {
              intersect: false, 
              mode: "index",
              callbacks: {
                label: function(tooltipItem, data) {
                  var label = data.datasets[tooltipItem.datasetIndex].label || '';

                  if (label) {
                    label += ': ';
                  }
                  label += Math.round(tooltipItem.yLabel * 100) / 100;
                  return label;
                }
              }
            }
          }
        );


      }
    }
  };
</script>
