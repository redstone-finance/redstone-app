<template>
  <div class="provider-manifests">
    <div class="manifest-list">
      <b-table
        ref="table"
        id="assets-table"
        stacked="md"
        hover
        :items="manifestsDataForTable"
        :fields="fields"
        @row-clicked="rowClicked">
          <template #cell(manifestTxId)="data">
            <a :href="'https://viewblock.io/arweave/tx/' + data.item.manifestTxId" target="_blank">
              {{ data.item.manifestTxId | tx }}
            </a>
          </template>

          <template #cell(changeMessage)="data">
            {{ data.item.changeMessage }}
          </template>

          <template #cell(uploadDate)="data">
            {{ data.item.uploadDate }}
          </template>

          <template #cell(status)="data">
            <label v-if="data.item.status === 'active'" class="manifest-status active">Active</label>
          </template>

          <template #cell(actions)="data">
            <i v-if="!data.item._showDetails" class="fa fa-plus" />
            <i v-else class="fa fa-minus" />
          </template>

          <template slot="row-details" slot-scope="data">
              <json-viewer
                :value="data.item.manifest"
                :expand-depth=1
                copyable
                sort></json-viewer>
          </template>
      </b-table>
    </div> 
    <div class="upload-wrapper">
      <input type="file" id="manifest-upload" class="manifest-input" accept="application/JSON" @input="fileUploaded"/>
      <b-button v-on:click="loadFile()" id="import" class="btn-danger btn-modal rounded-pill" variant="primary">Add new manifest</b-button>
      <b-modal id="manifest-modal" title="Check your manifest" size="xl" >
          <json-viewer
          :value="newManifest"
          :expand-depth=1
          copyable
          sort></json-viewer>
          <template #modal-footer >
            <div>
              <b-button v-on:click="uploadManifest()" class="btn-danger btn-modal rounded-pill" variant="primary">Upload manifest</b-button>
            </div>
            </template>
        </b-modal>
    </div>  
  </div>
</template>

<script>
import JsonViewer from 'vue-json-viewer'
import Arweave from 'arweave';
// const providersRegistry = require("redstone-smartweave-contracts/src/tools/providers-registry.api");

export default {
  name: "Provider",

  props: {
    manifests: Array
  },

  data() {
    return {
      newManifest: "",
      fields: [
        'manifestTxId',
        'changeMessage', 
        'uploadDate', 
        'status',
        { key: 'actions', label: ''}
      ],
      manifestsDataForTable: []
    }; 
  },

  mounted() {
    this.getManifestsData();
  },

  methods: {
    getManifestsData() {
      this.manifestsDataForTable = this.manifests.slice().reverse().map((manifest, index) => {
        return {
          manifestTxId: manifest.manifestTxId,
          changeMessage: manifest.changeMessage,
          manifest: manifest.manifest,
          uploadDate: null,
          status: index === 0 ? 'active' : '',
          _showDetails: false
        };
      });

      this.manifestsDataForTable.forEach(
        async (manifest, index) => {
          let time = await this.transactionTime(manifest.manifestTxId);
          this.manifestsDataForTable[index].uploadDate = time;
          this.$refs.table.refresh();
        }
      )
    },

    async uploadManifest() {
      // const result = await providersRegistry.currentManifest('provider_qZfxiw8Rl3ywD9e4F-nxLOCzZqU1MibNcep4DWvTgkQ"', true);
      console.log(result)

      // if (!window.arweaveWallet)

      // const connectResult = await window.arweaveWallet.connect(['ACCESS_ADDRESS']);

      const arweave = Arweave.init({
        host: "arweave.net",
        protocol: "https",
        port: 443,
      });

      let transaction = await arweave.createTransaction({
          // target: 'I-5rWUehEv-MjdK9gFw09RxfSLQX9DIHxG614Wf8qo0',
          // quantity: arweave.ar.arToWinston('0.001')
      });

      await arweave.transactions.sign(transaction);

      // const response = await arweave.transactions.post(transaction);
    },

    loadFile() {
      document.getElementById('manifest-upload').value = "";
      document.getElementById('manifest-upload').click();
    },

    fileUploaded() {
      let file = document.getElementById('manifest-upload').files[0];

      var fr = new FileReader();

      fr.onload = function(e) { 
        this.newManifest = JSON.parse(e.target.result);
        this.$bvModal.show('manifest-modal');
      }.bind(this)

      fr.readAsText(file);
    },

    rowClicked(record) {
      this.$set(record, '_showDetails', !record._showDetails)
    },

    transactionTime(id) {
      return fetch(`https://arweave.net/tx/${id}/status`)
        .then(
          response => {
            return response.json()
          })
        .then(
          status => {
            return fetch(`https://arweave.net/block/hash/${status.block_indep_hash}`);  
          })
        .then(
          response => {
            return response.json()
          })
        .then(
          blockInfo => {
            return new Date(blockInfo.timestamp * 1000).toLocaleDateString("en-GB");
          }
        )
    },
  },

  components: {
    JsonViewer  
  },

  computed: {
    getManifest(id) {
      return this.manifests.find(el => el.manifestTxId === id);
    },
  }
}
</script>

<style lang="scss" scoped>
@import '~@/styles/app';

.custom-select {
  width: min-content;
}

.provider-manifests {
  & > div {
    margin-bottom: 15px;
  }

  .manifestId {
    font-weight: $font-weight-soft-bold;

    &.chosen {
      font-weight: $font-weight-semi-bold;
    }
  }
}

.upload-wrapper {
  position: relative;

  .manifest-upload {
    position: absolute;
  }

  .manifest-input {
    position: absolute;
    opacity: 0;
    z-index: -1;
  }
}

.manifest-status {
  &.active {
    height: 20px;
    border-radius: 10px;
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 4px;
    background-color: $teal;
    font-size: $font-size-index;
    font-weight: $font-weight-semi-bold;
    color: $white;
    text-transform: uppercase;
  }
}

</style>

<style>
.provider-manifests .manifest-list tr:not(.b-table-details) {
  cursor: pointer;
}
</style>
