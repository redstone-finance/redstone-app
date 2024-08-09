<template>
    <Loader v-if="isLoading" class="feeds__loader" />
    <span v-else class="feeds__timestamp">
        <span v-if="heartbeatIsNumber(heartbeat)">
            <to-date-counter :duration="heartbeat" />
        </span>
        <div v-else>
            <span style="cursor: pointer;" :id="`cron-trigger-${layerId}`">
                <to-date-counter class="d-inline" :duration="nearestCron(heartbeat)" />
            </span>
        </div>
    </span>
</template>

<script>
import Loader from '@/components/Loader/Loader.vue'
import ToDateCounter from './ToDateCounter.vue'
import { findNearestCronDate, timeUntilDate } from '@/core/timeHelpers'

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
        }
    },
    methods: {
        heartbeatIsNumber(heartbeat) {
            return typeof heartbeat === 'number'
        },
        nearestCron(cronString) {
            const nearestDate = findNearestCronDate(JSON.parse(cronString))
            const timeUntil = timeUntilDate(nearestDate)
            return timeUntil
        },
    }
}
</script>