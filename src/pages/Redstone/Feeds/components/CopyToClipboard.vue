<template>
  <span
    v-b-tooltip.hover.html="tooltipHtml"
    class="feeds__copy-icon"
    :class="isCopied ? 'fa fa-check text-success' : 'fa fa-copy'"
    @click.prevent="handleCopy"
  ></span>
</template>

<script>
  import copyToClipboard from "@/core/copyToClipboard";

  export default {
    name: "CopyToClipboard",
    props: {
      value: {
        type: String,
        required: true,
      },
      copyText: {
        type: String,
        default: "Click to copy",
      },
      copiedText: {
        type: String,
        default: "Copied!",
      },
      duration: {
        type: Number,
        default: 2000,
      },
    },
    data() {
      return {
        isCopied: false,
      };
    },
    computed: {
      tooltipHtml() {
        return this.isCopied
          ? `${this.copiedText} <i class="fa fa-check text-success"></i>`
          : this.copyText;
      },
    },
    methods: {
      async handleCopy(event) {
        await copyToClipboard(event, this.value);
        this.isCopied = true;
        setTimeout(() => {
          this.isCopied = false;
        }, this.duration);
      },
    },
  };
</script>

<style scoped>
  .text-success {
    color: #28a745;
}

.feeds__copy-icon {
    cursor: pointer;
}
</style>
