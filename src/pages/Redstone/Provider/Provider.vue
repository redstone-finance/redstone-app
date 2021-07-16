<template>
  <div class="provider d-flex flex-column">
    <vue-loaders-ball-beat
      v-if="fetching"
      class="mt-5 loader align-self-center"
      color="var(--redstone-red-color)"
      scale="0.5"></vue-loaders-ball-beat>
    <div class="d-flex align-items-center mb-3" v-if="provider && provider.profile">
      <img class="provider-logo" :src="provider.profile.imgUrl" />
      <div class="provider-name ml-3">{{ provider.profile.name }}</div>
    </div>
    <div class="provider-tabs" v-if="provider && provider.manifests">
      <b-tabs>
        <b-tab title="Details">
          <ProviderDetails :provider="provider"/>
        </b-tab>
        <b-tab title="Manifests">
          <Manifests :provider="provider"/>
        </b-tab>
      </b-tabs>
    </div>
  </div>
</template>

<script>
import ProviderDetails from '@/components/Provider/ProviderDetails';
import Manifests from '@/components/Provider/Manifests';
const {interactRead} = require("@kyve/query");
// const {interactRead} = require("smartweave");
import dummyWallet from '@/dummy-wallet.json';

export default {
  name: "Provider",

  data() {
    return {
      provider: {},
      selectedManifest: {},
      fetching: true
    }; 
  },

  async mounted() {
    this.getProviderInfo().then(
      info => { 
        this.provider = info;
        this.fetching = false;
      }
    )
  },

  created() {

  },

  methods: {
    async getProviderInfo() {
      let providerData = await interactRead(
          this.kyvePoolId,
          await this.providersRegistryContractId(),
        {
          function: "providerData",
          data: {
            providerId: this.providerId,
            eagerManifestLoad: true
          }
        },
        dummyWallet
      );

//for Smartweave library
      // let providerData = await interactRead(
      //   this.arweave,
      //   dummyWallet,
      //   await this.providersRegistryContractId(),
      //    {
      //       function: "providerData",
      //       data: {
      //         providerId: this.providerId,
      //         eagerManifestLoad: true
      //       }
      //     }
      // );

      console.log(providerData)

      return providerData.provider;
    }
  },

  components: {
    ProviderDetails,
    Manifests  
  },

  computed: {
    providerId() {
      return this.$route.params.id;
    }
  }
}
</script>

<style src="./Provider.scss" lang="scss" scoped />
<style lang="scss"  >
.provider-tabs > .tabs > div:first-of-type {
   height: 44px; 
}
</style>

