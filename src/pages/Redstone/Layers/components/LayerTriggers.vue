<template>
    <div class="layers__details-title layers__details-title--triggers">
        <label class="layers__label">Update triggers</label>
        <pre class="layers__triggers" v-b-tooltip.hover title="Click to copy"
            @click.stop="copyToClipboard($event, JSON.stringify(updateTriggers))">
        <code v-text="updateTriggers"></code>
      </pre>
    </div>
</template>

<script>
import copyToClipboardHelper from '../../../../core/copyToClipboard.js';

export default {
    name: 'LayerTriggers',
    props: {
        updateTriggers: {
            type: Object,
            required: true
        }
    },
    methods: {
        copyToClipboard(event, text) {
            copyToClipboardHelper(event, text);
        }
    }
};
</script>