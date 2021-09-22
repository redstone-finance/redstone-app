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
