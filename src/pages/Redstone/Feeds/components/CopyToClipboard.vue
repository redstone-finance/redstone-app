<template>
    <span v-b-tooltip.hover :title="tooltipText" class="feeds__copy-icon glyphicon glyphicon-book"
        @click.prevent="handleCopy">
        
        </span>
</template>

<script>
import copyToClipboard from '@/core/copyToClipboard'

export default {
    name: 'CopyToClipboard',
    props: {
        value: {
            type: String,
            required: true
        },
        copyText: {
            type: String,
            default: 'Copy to clipboard'
        },
        copiedText: {
            type: String,
            default: 'Copied!'
        },
        duration: {
            type: Number,
            default: 2000
        }
    },
    data() {
        return {
            tooltipText: this.copyText
        }
    },
    methods: {
        async handleCopy(event) {
            await copyToClipboard(event, this.value)
            this.tooltipText = `${this.copiedText}`
            setTimeout(() => {
                this.tooltipText = this.copyText
            }, this.duration)
        }
    }
}
</script>