<script>
  import Chart from 'chart.js'
  import { generateChart } from 'vue-chartjs'
  import { getDetailsForSymbol } from "@/tokens";


  Chart.defaults.LineWithLine = Chart.defaults.line;
  Chart.controllers.LineWithLine = Chart.controllers.line.extend({
    draw: function(ease) {
      Chart.controllers.line.prototype.draw.call(this, ease);

      if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
        var activePoint = this.chart.tooltip._active[0],
        ctx = this.chart.ctx,
        x = activePoint.tooltipPosition().x,
        y = activePoint.tooltipPosition().y,
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

        // draw point
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
        ctx.fill();   


         ctx.restore();
      }
   }
  })

  const CustomLine = generateChart('custom-line', 'LineWithLine')

  export default {
    extends: CustomLine,
    props: {
      symbol: String,
      data: Object,
    },
    watch: {
      data: function(chartData) { // watch it
        const symbol = this.symbol
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
                  unitStepSize: chartData.timeUnit == 'minute' ? 5 : 1
                },
                ticks: {
                  // forces step size to be 5 units
                  stepSize: 12 // <----- This prop sets the stepSize
                }
              }],
              yAxes: [
                {
                    ticks: {
                        userCallback: function(value, index, values) {
                          const valueCalculated = value.toLocaleString('en-US', {minimumFractionDigits: 2});
                          const customUrlTag = getDetailsForSymbol(symbol).tags.includes('custom-urls')
                          const nftTag =  getDetailsForSymbol(symbol).tags.includes('nft')
                          return nftTag || customUrlTag ? valueCalculated : `$ ${valueCalculated}`; // this is all we need
                        }
                    }
                }
              ]
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
              backgroundColor: '#242F51',
              callbacks: {
                label: function(tooltipItem, data) {
                  var label = data.datasets[tooltipItem.datasetIndex].label || '';

                  if (label) {
                    label += ': ';
                  }
                  label += (Math.round(tooltipItem.yLabel * 100) / 100).toLocaleString('en-US');
                  const customUrlTag = getDetailsForSymbol(symbol).tags.includes('custom-urls')
                  const nftTag =  getDetailsForSymbol(symbol).tags.includes('nft')
                  return nftTag || customUrlTag ? label : `$ ${label}` ;
                }
              }
            }
          }
        );
      }
    }
  };
</script>
