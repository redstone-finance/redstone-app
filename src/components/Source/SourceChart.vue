<script>
  import { Bar } from 'vue-chartjs'

  export default {
    extends: Bar,
    props: ['stats', 'color', 'title'],

    computed: {
      dataPoints() {
        return Object.fromEntries(Object.entries(this.stats).reverse());
      },

      labels() {
        return Object.keys(this.dataPoints);
      },

      values() {
        return Object.values(this.dataPoints);
      }
    },

    watch: {
      "stats": function() {
        const chartData = {
          labels: this.labels,
          datasets: [
            {
              label: this.title,
              data: this.values,
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
