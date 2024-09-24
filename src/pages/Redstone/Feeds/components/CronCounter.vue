<template>
  <div 
    class="timer-container"
    v-b-tooltip.hover
    :title="formattedTime || 'Heartbeat'"
  >
    <svg class="timer-svg" viewBox="0 0 50 50">
      <circle
        class="timer-circle-bg"
        r="20"
        cx="25"
        cy="25"
      />
      <circle
        class="timer-circle-progress"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="strokeDashoffset"
        r="20"
        cx="25"
        cy="25"
      />
      <path
        d="M25 36.7l-1.5-1.4c-5.3-4.8-8.8-8-8.8-11.9 0-3.2 2.5-5.7 5.7-5.7 1.8 0 3.5 0.8 4.6 2.1 1.1-1.3 2.8-2.1 4.6-2.1 3.2 0 5.7 2.5 5.7 5.7 0 3.9-3.5 7.1-8.8 11.9L25 36.7z"
        :class="['heart-icon', { 'heart-icon--beating': isBeating }]"
      />
    </svg>
  </div>
</template>

<script>
import { intervalToDuration, formatDuration, differenceInSeconds, addDays, set, isSameDay, parseISO } from 'date-fns'
import cronParser from 'cron-parser'

export default {
  name: 'CronBasedTimer',
  props: {
    crons: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      remainingTime: 0,
      totalInterval: 0,
      radius: 20,
      isBeating: false,
      timerInterval: null,
      beatTimeout: null,
      currentTime: new Date(),
      parsedCrons: [],
      lastEventTime: null,
      nextEventTime: null,
    };
  },
  computed: {
    cronEvents() {
      const events = [];
      const today = new Date();
      const tomorrow = addDays(today, 1);

      this.parsedCrons.forEach(cronString => {
        try {
          // Get events for today
          let interval = cronParser.parseExpression(cronString, { currentDate: set(today, {hours: 0, minutes: 0, seconds: 0, milliseconds: 0}) });
          for (let i = 0; i < 24; i++) { // Assuming max 24 events per day
            const next = interval.next();
            if (next.getDate() !== today.getDate()) break;
            events.push({ date: next.toDate(), cron: cronString });
          }

          // Get events for tomorrow
          interval = cronParser.parseExpression(cronString, { currentDate: set(tomorrow, {hours: 0, minutes: 0, seconds: 0, milliseconds: 0}) });
          for (let i = 0; i < 24; i++) { // Assuming max 24 events per day
            const next = interval.next();
            if (next.getDate() !== tomorrow.getDate()) break;
            events.push({ date: next.toDate(), cron: cronString });
          }
        } catch (err) {
          console.error(`Error parsing cron expression: ${cronString}`, err);
        }
      });

      return events.sort((a, b) => a.date - b.date);
    },
    circumference() {
      return 2 * Math.PI * this.radius;
    },
    strokeDashoffset() {
      if (this.totalInterval === 0) return 0;
      const progress = 1 - (this.remainingTime / this.totalInterval);
      return this.circumference * (1 - progress);
    },
    formattedTime() {
      const duration = intervalToDuration({ start: 0, end: Math.max(0, this.remainingTime) * 1000 });
      const format = ['seconds'];
      if (duration.minutes > 0 || duration.hours > 0) format.unshift('minutes');
      if (duration.hours > 0) format.unshift('hours');
      return formatDuration(duration, { format, zero: true });
    },
  },
  watch: {
    crons: {
      immediate: true,
      handler(newCrons) {
        try {
          this.parsedCrons = JSON.parse(newCrons);
          if (!Array.isArray(this.parsedCrons)) {
            throw new Error('Parsed crons is not an array');
          }
          this.startTimer();
        } catch (error) {
          console.error('Error parsing crons:', error);
          this.parsedCrons = [];
        }
      },
    },
  },
  methods: {
    startTimer() {
      this.clearTimers();
      this.updateTimer();
      
      const tick = () => {
        this.updateTimer();
        
        if (this.remainingTime <= 0) {
          this.finishTimer();
        } else {
          this.timerInterval = setTimeout(tick, 1000);
        }
      };

      this.timerInterval = setTimeout(tick, 1000);
    },
    updateTimer() {
      this.currentTime = new Date();
      const events = this.cronEvents;
      
      if (events.length > 0) {
        const nextEventIndex = events.findIndex(event => event.date > this.currentTime);
        
        if (nextEventIndex !== -1) {
          this.nextEventTime = events[nextEventIndex].date;
          
          if (nextEventIndex > 0) {
            this.lastEventTime = events[nextEventIndex - 1].date;
          } else {
            // If it's the first event of the day, use the last event of the previous day or midnight
            this.lastEventTime = set(this.currentTime, { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
          }
          
          this.remainingTime = Math.max(0, differenceInSeconds(this.nextEventTime, this.currentTime));
          this.totalInterval = differenceInSeconds(this.nextEventTime, this.lastEventTime);
        } else {
          // If all events for today have passed, use the first event of tomorrow
          this.nextEventTime = events[0].date;
          this.lastEventTime = set(this.currentTime, { hours: 23, minutes: 59, seconds: 59, milliseconds: 999 });
          this.remainingTime = Math.max(0, differenceInSeconds(this.nextEventTime, this.currentTime));
          this.totalInterval = differenceInSeconds(this.nextEventTime, this.lastEventTime);
        }
      } else {
        this.remainingTime = 0;
        this.totalInterval = 0;
      }
    },
    startBeat() {
      this.isBeating = true;
      if (this.beatTimeout) {
        clearTimeout(this.beatTimeout);
      }
      this.beatTimeout = setTimeout(() => {
        this.isBeating = false;
      }, 1500);
    },
    finishTimer() {
      this.startBeat();
      this.$nextTick(() => {
        setTimeout(() => {
          this.startTimer();
        }, 0);
      });
    },
    clearTimers() {
      if (this.timerInterval) {
        clearTimeout(this.timerInterval);
      }
    },
  },
  beforeUnmount() {
    this.clearTimers();
    if (this.beatTimeout) {
        clearTimeout(this.beatTimeout);
      }
  },
};
</script>

<style scoped>
.timer-container {
  position: relative;
  width: 30px;
  height: 30px;
}

.timer-svg {
  width: 100%;
  height: 100%;
}

.timer-circle-bg {
  stroke: #e5e7eb;
  stroke-width: 3;
  fill: transparent;
}

.timer-circle-progress {
  stroke: rgb(80, 80, 80);
  stroke-width: 3;
  stroke-linecap: round;
  fill: transparent;
  transform: rotate(-90deg);
  transform-origin: center;
  transition: stroke-dashoffset 100ms linear;
}

.heart-icon {
  fill: #9ca3af;
  transform-origin: center;
  transition: transform 0.3s ease, fill 0.3s ease;
}

.heart-icon--beating {
  fill: var(--redstone-red-color);
  animation: heartbeat 1.5s ease-in-out;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  14% { transform: scale(1.3); }
  28% { transform: scale(1); }
  42% { transform: scale(1.3); }
  70% { transform: scale(1); }
}
</style>