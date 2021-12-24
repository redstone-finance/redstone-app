<template>
  <div class="provider d-flex flex-column">
    <div class="d-flex align-items-center mb-3" v-if="provider && provider.profile">
      <img class="provider-logo" :src="provider.profile.imgUrl" />
      <div class="provider-name ml-3">{{ provider.profile.name }}</div>
    </div>
    <div v-else class="preloaders">
      <div class="preloader logo-preloader"></div>
      <div class="preloader text-preloader"></div>
    </div>
    <div class="provider-tabs">
      <b-tabs>
        <b-tab title="Details">
          <ProviderDetails :provider="provider"/>
        </b-tab>
        <b-tab title="Manifests">
          <Manifests :provider="provider" :providerId="providerId" />
        </b-tab>
      </b-tabs>
    </div>
  </div>
</template>

<script>
import ProviderDetails from '@/components/Provider/ProviderDetails';
import Manifests from '@/components/Provider/Manifests';
import { mapState } from 'vuex';

export default {
  name: "Provider",

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
    ProviderDetails,
    Manifests  
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
    }
  },
}
</script>

<style src="./Provider.scss" lang="scss" scoped />
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

