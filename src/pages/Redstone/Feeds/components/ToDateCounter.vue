<template>
    <div class="counter">
        {{ formattedTime }}
    </div>
</template>

<script>
import { intervalToDuration } from 'date-fns'

export default {
    props: {
        duration: {
            type: Number,
            required: true
        }
    },
    data() {
        return {
            remainingTime: 0
        };
    },
    computed: {
        formattedTime() {
            if (this.remainingTime <= 0) {
                return '00:00:00';
            }

            const duration = intervalToDuration({ start: 0, end: this.remainingTime });
            const hours = String(duration.hours || 0).padStart(2, '0');
            const minutes = String(duration.minutes || 0).padStart(2, '0');
            const seconds = String(duration.seconds || 0).padStart(2, '0');

            return `${hours}:${minutes}:${seconds}`;
        }
    },
    watch: {
        duration: {
            immediate: true,
            handler(newDuration) {
                this.remainingTime = newDuration;
                this.startTimer();
            }
        }
    },
    methods: {
        startTimer() {
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
            }

            this.timerInterval = setInterval(() => {
                if (this.remainingTime > 0) {
                    this.remainingTime = Math.max(0, this.remainingTime - 1000);
                } else {
                    clearInterval(this.timerInterval);
                }
            }, 1000);
        }
    },
    beforeDestroy() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }
};
</script>