export default {
  data() {
    return {
    }
  },
  methods: {
    formatInterval(interval) {
      const milisecondsInDay = 1000 * 60 * 60 * 24;
      const milisecondsInHour = 1000 * 60 * 60;
      const milisecondsInMinute = 1000 * 60;
      const milisecondsInSecond = 1000;

      const days = Math.max(0, parseInt(interval / milisecondsInDay));
      interval = interval - days * milisecondsInDay;
      const hours = Math.max(0, parseInt(interval / milisecondsInHour));
      interval = interval - hours * milisecondsInHour;
      const minutes = Math.max(0, parseInt(interval / milisecondsInMinute));
      interval = interval - minutes * milisecondsInMinute;
      const seconds = Math.max(0, parseInt(interval / milisecondsInSecond));
      interval = interval - seconds * milisecondsInSecond;
      const miliseconds = interval;

      let result = "";
      if (days > 0) result += days + (days == 1 ? " day" : " days")
      if (hours > 0) result +=  " " + hours + " h";
      if (minutes > 0) result +=  " " + minutes + " min";
      if (seconds > 0) result += " " + seconds + " s";
      if (miliseconds > 0) result += " " + miliseconds + " ms";

      return result;
    }
  }
};
