<template>
  <div class="provider-manifests">
    <div class="manifest-select">
      <b-form>
        <b-form-group label="Select manifest" label-for="select-manifest">
          <b-form-select v-model="selectedManifestId" :options="manifests" value-field="manifestTxId" text-field="manifestTxId" id="select-manifest"></b-form-select>
        </b-form-group>          
      </b-form>
    </div> 
    <div>
      <a :href="'https://viewblock.io/arweave/tx/' + selectedManifest.manifestTxId" target="_blank">Check on ViewBlock</a>
    </div>   
    <div v-if="manifests">
      <!-- <pre>
        <code>{{ JSON.stringify(manifests[0].manifest, null, '\t') }}</code>
      </pre>   -->
      <json-viewer
        :value="selectedManifest.manifest"
        :expand-depth=1
        copyable
        boxed
        sort></json-viewer>
    </div>
  </div>
</template>

<script>
import JsonViewer from 'vue-json-viewer'

export default {
  name: "Provider",

  props: {
    manifests: Array
  },

  data() {
    return {
      selectedManifestId: this.manifests[0].manifestTxId,
    }; 
  },

  created() {

  },

  methods: {
  },

  components: {
    JsonViewer  
  },

  computed: {
    selectedManifest() {
      return this.manifests.find(el => el.manifestTxId === this.selectedManifestId);
    },
  }
}
</script>

<style lang="scss" scoped>
.custom-select {
  width: min-content;
}

.provider-manifests {
  & > div {
    margin-bottom: 15px;
  }
}
</style>
