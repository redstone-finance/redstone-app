<!-- HeartbeatCounter.vue -->
<template>
    <Loader v-if="isLoading" class="feeds__loader" />
    <span v-else class="feeds__timestamp">
        <span v-if="isNumericHeartbeat">
            <to-date-counter :duration="timeUntilNextHeartbeat" />
        </span>
        <div v-else>
            <span style="cursor: pointer;" :id="`cron-trigger-${layerId}`">
                <to-date-counter class="d-inline" :duration="timeUntilNearestCron" />
            </span>
        </div>
    </span>
</template>

<script>
import Loader from '@/components/Loader/Loader.vue'
import ToDateCounter from './ToDateCounter.vue'
import {
    getTimeUntilNextHeartbeat,
    findNearestCronDate,
    timeUntilDate,
    parseUnixTime
} from '@/core/timeHelpers'

export default {
    name: 'HeartbeatCounter',
    components: {
        Loader,
        ToDateCounter
    },
    props: {
        isLoading: {
            type: Boolean,
            default: false
        },
        heartbeat: {
            type: [Number, String, Array],
            required: true
        },
        layerId: {
            type: [Number, String],
            required: true
        },
        heartbeatInterval: {
            type: Number,
            default: 60000 // Default to 1 minute if not provided
        }
    },
    computed: {
        isNumericHeartbeat() {
            return typeof this.heartbeat === 'number'
        },
        timeUntilNextHeartbeat() {
            if (this.isNumericHeartbeat) {
                return getTimeUntilNextHeartbeat(this.heartbeat, this.heartbeatInterval)
            }
            return 0
        },
        timeUntilNearestCron() {
            if (!this.isNumericHeartbeat) {
                const cronExpressions = Array.isArray(this.heartbeat) ? this.heartbeat : [this.heartbeat]
                const nearestDate = findNearestCronDate(cronExpressions)
                return nearestDate ? timeUntilDate(nearestDate) : 0
            }
            return 0
        },
        formattedTime() {
            const duration = this.isNumericHeartbeat ? this.timeUntilNextHeartbeat : this.timeUntilNearestCron
            return parseUnixTime(Math.floor(duration / 1000))
        }
    }
}
</script>