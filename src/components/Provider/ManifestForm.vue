<template>
  <b-modal id="manifest-form-modal" title="Prepare your manifest" size="xl" class="manifest-modal" @close="close">
    <b-form @submit="onSubmit">
      <b-row>
        <b-col>
          <h3>Manifest info:</h3>
          <div class="ml-2">
            <label for="message-input">Change message:</label>
            <b-form-input v-model="manifest.manifestChangeMessage" id="change-message" placeholder="Manifest change message" required />
            <label for="locked-hours-input" class="mt-3">Locked hours:</label>
            <b-form-input v-model="manifest.manifestLockedHours" min="0" type="number" id="locked-hours-input" placeholder="Locked hours" />
            <b-form-invalid-feedback :state="lockedHoursValidation">
              Locked hours should be a non-negative integer number.
            </b-form-invalid-feedback>
          </div>

          <h3 class="mt-3">Manifest</h3>
          <div class="ml-2">
            <label for="evmChainId">EVM Chain ID:</label>
            <b-form-input v-model="manifest.manifestData.evmChainId" id="evmChainId" placeholder="" required />
            <label for="interval">Interval:</label>
            <b-form-input v-model="manifest.manifestData.interval" id="interval" type="number" placeholder="" required />
            <label for="maxPriceDeviationPercent">Maximum Price Deviation Percent:</label>
            <b-form-input v-model="manifest.manifestData.maxPriceDeviationPercent"  type="number" id="maxPriceDeviationPercent" placeholder="" required />
            <label for="priceAggregator">Price Aggregator:</label>
            <b-form-input v-model="manifest.manifestData.priceAggregator" id="priceAggregator" placeholder="" required />
            <label for="sourceTimeout">Source timeout:</label>
            <b-form-input v-model="manifest.manifestData.sourceTimeout" type="number" id="sourceTimeout" placeholder="" required />

            <div class="mt-3">
              <h4>New Token</h4>
              <label for="tokenSymbol">Token Symbol:</label>
              <b-form-input v-model="tokenSymbol" id="tokenSymbol" placeholder="" required />
              <label for="tokenSource">Token Source:</label>
              <b-form-input v-model="tokenSource" id="tokenSource" placeholder="" required />
            </div>
          </div>
        </b-col>
        <b-col>
          <div class="viewer-wrapper">
            <h3>Preview:</h3>
            <json-viewer
              class="mt-3 viewer"
              :value="manifest.manifestData"
              :expand-depth=1
              copyable
              sort></json-viewer>
          </div>
        </b-col>
      </b-row>
      

      <div class="mt-3 manifest-btn-wrapper">
        <b-button type="submit" class="btn-danger btn-modal rounded-pill" variant="primary">Upload manifest</b-button>
      </div>
    </b-form>
    <template #modal-footer >
      <div>
      </div>
    </template>
  </b-modal>
</template>

<script>
import JsonViewer from 'vue-json-viewer'

export default {
  name: "ManifestForm",

  props: {
    initialManifest: null
  },

  data() {
    return {
      manifest: {
        manifestChangeMessage: null,
        manifestLockedHours: null,
        manifestData: {}
      },
      tokenSymbol: null,
      tokenSource: null
    }
  },

  mounted() {
    this.$root.$on('bv::hide::modal', (bvEvent, modalId) => {
      console.log('Modal is about to be closed', bvEvent, modalId)
    })
    this.$bvModal.show('manifest-form-modal');
    this.initManifest();
  },

  methods: {
    initManifest() {
      if (this.initialManifest) {
        this.manifest = {};
        this.manifest.changeMessage = this.initialManifest.changeMessage;
        this.manifest.lockedHours = this.initialManifest.lockedHours;
        if (this.initialManifest.manifestData) {
          this.manifest.manifestData = {};
          this.manifest.manifestData.evmChainId = this.initialManifest.manifestData.evmChainId;
          this.manifest.manifestData.interval = this.initialManifest.manifestData.interval;
          this.manifest.manifestData.maxPriceDeviationPercent = this.initialManifest.manifestData.maxPriceDeviationPercent;
          this.manifest.manifestData.priceAggregator = this.initialManifest.manifestData.priceAggregator;
          this.manifest.manifestData.sourceTimeout = this.initialManifest.manifestData.sourceTimeout;
          this.manifest.manifestData.tokens = this.initialManifest.manifestData.tokens;
        }
      } else {
        this.manifest = {};
        this.manifest.manifestData = {}
      }
    },
    onSubmit () {
      this.$root.$emit('manifestSubmitted', this.manifestData)
    },
    close(bvModalEvt) {
      bvModalEvt.preventDefault();
      this.$root.$emit('manifestFormClosed');
    }
  },

  components: {
    JsonViewer
  },

  computed: {
    lockedHoursValidation() {
      return parseInt(this.manifest.manifestLockedHours) >= 0;
    },
  }
}
</script>

<style lang="scss" scoped>
@import '~@/styles/app';
  .viewer-wrapper {
    height: 100%;

    .viewer {
      height: 100%;
    }
  }
</style>
