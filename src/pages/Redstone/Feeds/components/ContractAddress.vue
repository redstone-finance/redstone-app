<template>
    <div>
        <div v-if="item.feed_address && item.explorer && item.feed_address != '__NO_FEED__'"
            :class="{ 'separate-labels': separateLabels }">
            <div class="d-inline" :class="{ 'label': separateLabels }">{{ separateLabels ? 'Price:' : 'Price feed address:' }}</div>
            <div class="d-inline">
                <a class="feeds__contract-address" :title="`Open address in ${item.explorer.name} explorer`"
                    target="_blank" :href="`${item.explorer.explorerUrl}/address/${item.feed_address}`">
                    {{ truncateString(item.feed_address, disableTruncate) }}
                </a>
                <CopyToClipboard copy-text="Copy feed address" :value="item.feed_address" />
            </div>
        </div>
        <div v-else :class="{ 'separate-labels': separateLabels }">
            <div class="d-inline" :class="{ 'label': separateLabels }">{{ separateLabels ? 'Adapter:' : 'Adapter address:' }}</div>
            <div class="d-inline">
                <a class="feeds__contract-address" :title="`Open address in ${item.explorer.name} explorer`"
                    target="_blank" :href="`${item.explorer.explorerUrl}/address/${item.contract_address}`">
                    {{ truncateString(item.contract_address, disableTruncate) }}
                </a>
                <CopyToClipboard copy-text="Copy adapter address" :value="item.contract_address" />
            </div>
        </div>
       
    </div>
</template>

<script>
import copyToClipboardHelper from '@/core/copyToClipboard'
import CopyToClipboard from './CopyToClipboard.vue';
import truncateString from "@/core/truncate"
import { type } from 'os';

export default {
    props: {
        item: {
            type: Object,
            required: true
        },
        separateLabels: {
            type: Boolean,
            default: false
        },
        disableTruncate: {
            type: Boolean,
            default: false
        }
    },
    components: {
        CopyToClipboard
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
    flex-direction: row;
    align-items: center;
    margin-bottom: 8px;
}

.label {
    font-size: 12px;
    margin-right: 10px;
    color: gray;
    font-weight: bold;
    display: block;

}

.separate-labels .feeds__contract-address {
    word-break: break-all;
    font-size: 14px;
}

.separate-labels .feeds__copy-icon {
    font-size: 12px;
    margin-left: 5px !important;
}
</style>