export default {
  methods: {
    activeFrom(transactionTime, lockedHours) {
      return new Date(transactionTime.getTime() + lockedHours * 60 * 60 * 1000);
    },
    dataPoints(interval, activeFrom) {
      return interval ? Math.floor((new Date().getTime() - activeFrom.getTime()) / interval): 0;
    } 
  },
  computed: {
  }
};
