<template>
    <Loader v-if="isLoading" class="feeds__loader" />
    <span v-else-if="rawTimestamp" class="feeds__timestamp">
        <span class="feeds__timestamp-date">
            {{ formattedDate }}
        </span>
        {{ parsedTimestamp }} ago
    </span>
    <span v-else class="feeds__no-data">no-data</span>
</template>

<script>
import Loader from '@/components/Loader/Loader.vue'
export default {
    name: 'TimestampDisplay',
    components: {
        Loader,
    },
    props: {
        isLoading: {
            type: Boolean,
            default: false
        },
        rawTimestamp: {
            type: [String, Number],
            default: null
        },
        formattedDate: {
            type: String,
            default: ''
        },
        parsedTimestamp: {
            type: String,
            default: ''
        }
    }
}
</script>