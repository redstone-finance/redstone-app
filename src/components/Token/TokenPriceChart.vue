<script>
  import { Line } from 'vue-chartjs';

  export default {
    extends: Line,
    props: ['data'],
    watch: {
      data: function(chartData) { // watch it
        // console.log('Data changed: ', chartData, ' | was: ', oldVal)

        this.renderChart(
          {
            labels: chartData.labels,
            datasets: [
              {
                data: chartData.values,
                backgroundColor: "transparent",
                borderColor: "#F55767",
                pointBackgroundColor: "#ffccbb"
              }
            ]
          },
          {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              xAxes: [{
                type: 'time',
                time: {
                  unit: 'day'
                }
              }]
            },
            legend: {
              display: false
            },
            tooltips: {
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
