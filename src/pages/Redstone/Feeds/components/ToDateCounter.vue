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
import { intervalToDuration, formatDuration } from 'date-fns'

export default {
  name: 'ToDateCounter',
  props: {
    duration: {
      type: Number,
      required: true,
    },
    interval: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      remainingTime: 0,
      radius: 20,
      isBeating: false,
      timerInterval: null,
      beatTimeout: null,
      isFirstCycle: true,
    };
  },
  computed: {
    circumference() {
      return 2 * Math.PI * this.radius;
    },
    strokeDashoffset() {
      const totalTime = this.isFirstCycle ? this.interval : this.interval;
      const elapsedTime = totalTime - this.remainingTime;
      const progress = elapsedTime / totalTime;
      return this.circumference * (1 - progress);
    },
    formattedTime() {
      const duration = intervalToDuration({ start: 0, end: this.remainingTime });
      const format = ['seconds'];
      if (duration.minutes > 0 || duration.hours > 0) format.unshift('minutes');
      if (duration.hours > 0) format.unshift('hours');
      return formatDuration(duration, { format, zero: true });
    },
  },
  watch: {
    duration: {
      immediate: true,
      handler() {
        this.startTimer();
      },
    },
    interval: {
      handler() {
        if (!this.isFirstCycle) {
          this.startTimer();
        }
      },
    },
  },
  methods: {
    startTimer() {
      this.clearTimers();
      if (this.isFirstCycle) {
        this.remainingTime = this.duration;
      } else {
        this.remainingTime = this.interval;
      }
      const tick = () => {
        if (this.remainingTime > 0) {
          this.remainingTime = Math.max(0, this.remainingTime - 100);
          this.timerInterval = setTimeout(tick, 100);
        } else {
          this.finishTimer();
        }
      };

      tick();
    },
    startBeat() {
      this.isBeating = true;
      this.beatTimeout = setTimeout(() => {
        this.isBeating = false;
      }, 1500);
    },
    finishTimer() {
      this.startBeat();
      this.isFirstCycle = false;
      this.$nextTick(() => {
        this.startTimer();
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