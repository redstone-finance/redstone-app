<template>
  <div class="provider-details">
    <div class="provider-info mt-2">
      <div class="mb-3">
        <h6>{{ provider.description }}</h6>
      </div> 
      <div>
        <a :href="provider.url" target="_blank">{{ provider.url }}</a>
      </div>   
      <div class="d-flex justify-content-between mt-2">
        <LabelValue label="Stake" :value="provider.stake" />
        <LabelValue label="Activation date" :value="provider.activeDate" />
        <LabelValue label="Interval" :value="provider.interval" />
        <LabelValue label="Data points" :value="provider.datapoints" />
        <LabelValue label="Disputes" :value="provider.disputes" />
      </div>
    </div>  
    <div>
      <Tokens class="provider-tokens" />
    </div>
  </div>
</template>

<script>
import LabelValue from '@/components/Provider/LabelValue';
//TODO: przenieść do oddzielnego komponentu
import Tokens from '@/pages/Redstone/Tokens/Tokens';

export default {
  name: "Provider",

  props: {
    provider: {}
  },

  data() {
  },

  mounted() {
  },

  created() {

  },

  methods: {
  },

  components: {
    LabelValue,
    //TODO: przenieść logikę page do componentu
    Tokens
  },

  computed: {
  }
}
</script>

<style lang="scss" scoped>
  .provider-details {

    .provider-info {
      margin-left: 28px;
      margin-right: 53px;
      margin-bottom: 30px;

      & > div {
        margin-bottom: 15px;
      }
    }

    LabelValue {
      margin-bottom: 10px;
    }
  }
</style>
