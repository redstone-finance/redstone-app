<template>
  <div 
    class="relative" 
    style="width: 50px; height: 50px;"
    v-b-tooltip.hover
    :title="formattedTime"
  >
    <svg class="w-full h-full" viewBox="0 0 50 50">
      <circle
        class="text-gray-200"
        stroke-width="5"
        stroke="currentColor"
        fill="transparent"
        r="20"
        cx="25"
        cy="25"
      />
      <circle
        class="text-blue-600 transition-all duration-1000 ease-linear"
        stroke-width="5"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="strokeDashoffset"
        stroke-linecap="round"
        stroke="currentColor"
        fill="transparent"
        r="20"
        cx="25"
        cy="25"
        transform="rotate(-90 25 25)"
      />
      <path
        d="M25 35.7l-1.5-1.4c-5.3-4.8-8.8-8-8.8-11.9 0-3.2 2.5-5.7 5.7-5.7 1.8 0 3.5.8 4.6 2.1 1.1-1.3 2.8-2.1 4.6-2.1 3.2 0 5.7 2.5 5.7 5.7 0 3.9-3.5 7.1-8.8 11.9L25 35.7z"
        :class="['heart-icon', { 'heartbeat': isFinished }]"
        fill="currentColor"
      />
    </svg>
  </div>
</template>

<script>
import { intervalToDuration, formatDuration } from 'date-fns'

export default {
  props: {
    duration: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      remainingTime: 0,
      radius: 20,
      isFinished: false,
      timerInterval: null,
      restartTimeout: null,
    };
  },
  computed: {
    circumference() {
      return 2 * Math.PI * this.radius;
    },
    strokeDashoffset() {
      return this.circumference * (1 - (this.duration - this.remainingTime) / this.duration);
    },
    formattedTime() {
      const duration = intervalToDuration({ start: 0, end: this.remainingTime });
      return formatDuration(duration, { format: ['hours', 'minutes', 'seconds'] });
    },
  },
  watch: {
    duration: {
      immediate: true,
      handler(newDuration) {
        this.startTimer(newDuration);
      },
    },
  },
  methods: {
    startTimer(duration) {
      this.clearTimers();
      this.remainingTime = duration;
      this.isFinished = false;

      this.timerInterval = setInterval(() => {
        if (this.remainingTime > 0) {
          this.remainingTime = Math.max(0, this.remainingTime - 1000);
        } else {
          this.finishTimer();
        }
      }, 1000);
    },
    finishTimer() {
      clearInterval(this.timerInterval);
      this.isFinished = true;
      
      // Restart the timer after 3 seconds
      this.restartTimeout = setTimeout(() => {
        this.startTimer(this.duration);
      }, 3000);
    },
    clearTimers() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
      }
      if (this.restartTimeout) {
        clearTimeout(this.restartTimeout);
      }
    },
  },
  beforeUnmount() {
    this.clearTimers();
  },
};
</script>

<style scoped>
.text-gray-200 {
  color: #e5e7eb;
}
.text-blue-600 {
  color: #2563eb;
}
.transition-all {
  transition-property: all;
}
.duration-1000 {
  transition-duration: 1000ms;
}
.ease-linear {
  transition-timing-function: linear;
}
.heart-icon {
  color: #ef4444;
  transform-origin: center;
  transition: transform 0.3s ease;
}
.heartbeat {
  animation: heartbeat 1.5s ease-in-out infinite;
}
@keyframes heartbeat {
  0% { transform: scale(1); }
  14% { transform: scale(1.3); }
  28% { transform: scale(1); }
  42% { transform: scale(1.3); }
  70% { transform: scale(1); }
}
</style>