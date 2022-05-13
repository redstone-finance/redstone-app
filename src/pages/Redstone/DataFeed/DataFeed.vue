<template>
  <div class="provider d-flex flex-column">
    <div v-if="provider">
      <div class="d-flex align-items-center">
        <img class="provider-logo" :src="provider.logo" />
        <div class="provider-name ml-3">{{ provider.name }}</div>
      </div>
      <div class="provider-id mb-3">id: {{ providerId }}</div>
    </div>
    <div v-else class="preloaders">
      <div class="preloader logo-preloader"></div>
      <div class="preloader text-preloader"></div>
    </div>
    <div class="provider-tabs">
      <b-tabs>
        <b-tab title="Details">
          <DataFeedDetails :provider="provider"/>
        </b-tab>
        <b-tab title="Nodes">
          <Nodes :nodes="provider?.nodes ?? []"/>
        </b-tab>
        <!-- <b-tab title="Manifests">
          <Manifests :provider="provider" :providerId="providerId" />
        </b-tab> -->
      </b-tabs>
    </div>
  </div>
</template>

<script>
import DataFeedDetails from '@/components/DataFeed/DataFeedDetails';
import Nodes from '@/components/DataFeed/Nodes';
import { mapState } from 'vuex';

export default {
  name: "DataFeed",

  data() {
    return {
      selectedManifest: {},
      fetching: true
    }; 
  },

  created() {

  },

  methods: {
  },

  components: {
    DataFeedDetails,
    Nodes
    // Manifests  
  },

  computed: {
    providerId() {
      return this.$route.params.id;
    },
    ...mapState("prefetch", {
      providers: (state) => state.providers
    }),
    provider() {
      return this.providers ? this.providers[this.providerId] : null;
    }
  },
}
</script>

<style src="./DataFeed.scss" lang="scss" scoped />
<style lang="scss"  >
.provider-tabs > .tabs > div:first-of-type {
   height: 44px; 
}

.provider-tabs {
  .nav-tabs > .nav-item {
    flex: 0 0 124px;
  }
}
</style>

