<template>
    <div class="layers__details-title">
        <label class="layers__label">Price feeds</label>
        <span class="layers__value d-block" v-for="(value, name, index) in priceFeeds" :key="index">
            {{ name }}: {{ value }}
        </span>
    </div>
</template>

<script>
export default {
    name: 'LayerPriceFeeds',
    props: {
        priceFeeds: {
            type: Object,
            required: true
        }
    }
}
</script>