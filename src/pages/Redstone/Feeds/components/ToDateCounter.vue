<template>
    <div class="counter">
        {{ formattedTime }}
    </div>
</template>

<script>
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
                return '00';
            }

            const hours = Math.floor(this.remainingTime / 3600000);
            const minutes = Math.floor((this.remainingTime % 3600000) / 60000);
            const seconds = Math.floor((this.remainingTime % 60000) / 1000);

            let result = '';

            if (hours > 0) {
                result += `${hours.toString().padStart(2, '0')}:`;
            }

            if (hours > 0 || minutes > 0) {
                result += `${minutes.toString().padStart(2, '0')}:`;
            }

            result += seconds.toString().padStart(2, '0');

            return result;
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