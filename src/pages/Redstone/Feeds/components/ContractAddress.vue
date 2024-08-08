<template>
    <div>
        <div v-if="item.contract_address && item.explorer" :class="{ 'separate-labels': separateLabels }">
            <div :class="{ 'label': separateLabels }">Contract address:</div>
            <div>
                <a class="feeds__contract-address" :title="`Open address in ${item.explorer.name} explorer`"
                    target="_blank" :href="`${item.explorer.explorerUrl}/address/${item.contract_address}`">
                    {{ separateLabels ? item.contract_address : truncateString(item.contract_address) }}
                </a>
                <span v-b-tooltip.hover @click.prevent="copyToClipboardHelper($event, item.contract_address)"
                    title="Copy to clipboard" class="feeds__copy-icon glyphicon glyphicon-book">
                </span>
            </div>
        </div>
        <div v-if="item.feed_address && item.explorer && item.feed_address != '__NO_FEED__'"
            :class="{ 'separate-labels': separateLabels }">
            <div :class="{ 'label': separateLabels }">Feed address:</div>
            <div>
                <a class="feeds__contract-address" :title="`Open address in ${item.explorer.name} explorer`"
                    target="_blank" :href="`${item.explorer.explorerUrl}/address/${item.feed_address}`">
                    {{ separateLabels ? item.feed_address : truncateString(item.feed_address) }}
                </a>
                <span v-b-tooltip.hover @click.prevent="copyToClipboardHelper($event, item.feed_address)"
                    title="Copy to clipboard" class="feeds__copy-icon glyphicon glyphicon-book">
                </span>
            </div>
        </div>
    </div>
</template>

<script>
import copyToClipboardHelper from '@/core/copyToClipboard'
import truncateString from "@/core/truncate"

export default {
    props: {
        item: {
            type: Object,
            required: true
        },
        separateLabels: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        copyToClipboardHelper,
        truncateString,
    },
}
</script>

<style scoped>
.separate-labels {
    display: flex;
    flex-direction: column;
    margin-bottom: 8px;
}

.label {
    font-weight: bold;
    margin-bottom: 4px;
}

.separate-labels .feeds__contract-address {
    word-break: break-all;
    font-size: 12px;
}

.separate-labels .feeds__copy-icon {
    font-size: 10px;
    margin-left: 5px !important;
}
</style>