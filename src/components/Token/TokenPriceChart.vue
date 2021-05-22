<script>
  import { Line } from 'vue-chartjs';

  export default {
    extends: Line,
    props: ['data'],
    watch: {
      data: function(chartData) { // watch it
        // TODO: remove
        // console.log('Data changed: ', chartData, ' | was: ', oldVal)
        console.log(chartData.datasets);

        this.renderChart(
          {
            labels: chartData.labels,
            datasets: chartData.datasets,
            // [
            //   {
            //     data: chartData.values,
            //     backgroundColor: "transparent",
            //     borderColor: "#F55767",
            //     pointBackgroundColor: "#ffccbb"
            //   },
            //   {
            //     data: chartData.values.map(v => v + 10),
            //     backgroundColor: "transparent",
            //     borderColor: "#123",
            //     pointBackgroundColor: "#fff"
            //   }
            // ]
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
