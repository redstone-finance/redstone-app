<template>
    <div>
        <div v-if="item.contract_address && item.explorer">
            Contract address: <a class="feeds__contract-address"
                :title="`Open address in ${item.explorer.name} explorer`" target="_blank"
                :href="`${item.explorer.explorerUrl}/address/${item.contract_address}`">
                {{ truncateString(item.contract_address) }}
            </a>
            <span v-b-tooltip.hover @click.prevent="copyToClipboardHelper($event, item.contract_address)"
                title="Copy to clipboard" class="feeds__copy-icon glyphicon glyphicon-book"></span>
        </div>
        <div v-if="item.feed_address && item.explorer && item.feed_address != '__NO_FEED__'">
            Feed address: <a class="feeds__contract-address" :title="`Open address in ${item.explorer.name} explorer`"
                target="_blank" :href="`${item.explorer.explorerUrl}/address/${item.contract_address}`">
                {{ truncateString(item.feed_address) }}
            </a>
            <span v-b-tooltip.hover @click.prevent="copyToClipboardHelper($event, item.feed_address)"
                title="Copy to clipboard" class="feeds__copy-icon glyphicon glyphicon-book"></span>
        </div>
    </div>
</template>

<script>
import copyToClipboardHelper from '@/core/copyToClipboard'
import truncateString from "@/core/truncate"

export default {
    props: ['item'],
    methods: {
        copyToClipboardHelper,
        truncateString,
    },
}
</script>