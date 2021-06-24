<template>
  <div class="provider">
    <div class="d-flex align-items-center mb-3">
      <img class="provider-logo" :src="provider.imgUrl" />
      <h1 class="ml-3">{{ provider.name }}</h1>
    </div>
    <div class="provider-tabs" v-if="provider && provider.manifests">
      <b-tabs>
        <b-tab title="Details">
          <ProviderDetails :provider="provider"/>
        </b-tab>
        <b-tab title="Manifests">
          <Manifests :manifests="provider.manifests"/>
        </b-tab>
      </b-tabs>
    </div>
  </div>
</template>

<script>
import ProviderDetails from '@/components/Provider/ProviderDetails';
import Manifests from '@/components/Provider/Manifests';
import providerData from './mock-provider.json';

export default {
  name: "Provider",

  data() {
    return {
      provider: {},
      selectedManifest: {}
    }; 
  },

  mounted() {
    this.provider = this.getProviderInfo();
  },

  created() {

  },

  methods: {
    getProviderInfo() {
      return providerData;
    }
  },

  components: {
    ProviderDetails,
    Manifests  
  },

  computed: {
    providerId() {
      return this.$route.params.providerId;
    }
  }
}
</script>

<style src="./Provider.scss" lang="scss" scoped />
