<script>
  import Chart from 'chart.js'
  import { generateChart, Bar } from 'vue-chartjs'

  export default {
    extends: Bar,
    props: ['stats', 'color', 'title'],
    watch: {
      "stats": function() {
        const chartData = {
          labels: Object.keys(this.stats).reverse(),
          datasets: [
            {
              label: this.title,
              data: Object.values(this.stats).reverse(),
              backgroundColor: this.color,
            },
            // {
            //   label: 'Fetching success count',
            //   data: Object.values(fetchingFailedData).map(v => 24 * 60 - v),
            //   backgroundColor: "#0F9D58",
            // },
            // {
            //   label: 'Incorrect price value count',
            //   data: Object.values(incorrectPriceData),
            //   backgroundColor: "#0F9D58",
            // },
          ],
        };
        this.renderChart(chartData, {
          scales: {
            y: {
              beginAtZero: true
            }
          },
          legend: {
            display: false
          },
          responsive: true,
          maintainAspectRatio: false
        });
      }
    }
  };
</script>
