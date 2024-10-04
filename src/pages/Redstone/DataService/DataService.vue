<template>
  <div class="provider d-flex flex-column">
    <div v-if="provider">
    </div>
    <div v-else class="preloaders">
      <div class="preloader logo-preloader"></div>
      <div class="preloader text-preloader"></div>
    </div>
    <div class="pull-model">
      <div class="pull-model__view-details">
      <h1>Pull Model</h1>
      <p>
        RedStone Pull Oracle offers robust, high frequency of data updates for broad range of assets.
      </p>
    </div>
      <DataServiceDetails :provider="provider" />
    </div>
  </div>
</template>

<script>
  import DataServiceDetails from "@/components/DataService/DataServiceDetails";
  import Nodes from "@/components/DataService/Nodes";
  import { mapState } from "vuex";

  export default {
    name: "DataService",

    data() {
      return {
        fetching: true,
      };
    },

    created() {},

    methods: {},

    components: {
      DataServiceDetails,
      Nodes,
      // Manifests
    },

    computed: {
      providerId() {
        return this.$route.params.id;
      },
      ...mapState("prefetch", {
        providers: (state) => state.providers,
      }),
      provider() {
        return this.providers ? this.providers[this.providerId] : null;
      },
    },
  };
</script>

<style src="./DataService.scss" lang="scss" scoped />
<style lang="scss">
  .provider-tabs > .tabs > div:first-of-type {
    height: 44px;
  }

  .provider-tabs {
    .nav-tabs > .nav-item {
      flex: 0 0 124px;
    }
  }
</style>
