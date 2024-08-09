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
export default {
    name: 'TimestampDisplay',
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