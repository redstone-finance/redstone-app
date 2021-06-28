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
            <label v-if="data.item.status" :class="'manifest-status ' + data.item.status">{{ data.item.status }}</label>
          </template>

          <template #cell(actions)="data">
            <i v-if="!data.item._showDetails" class="fa fa-chevron-down" />
            <i v-else class="fa fa-chevron-up" />
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
      <b-modal id="manifest-modal" title="Check your manifest" size="xl" class="manifest-modal">
        <b-form @submit="onSubmit">
          <label for="message-input">Change message:</label>
          <b-form-input v-model="manifestChangeMessage" id="message-input" placeholder="Manifest change message" required />
          <label for="locked-hours-input" class="mt-3">Locked hours:</label>
          <b-form-input v-model="manifestLockedHours" min="0" type="number" id="locked-hours-input" placeholder="Locked hours" />
          <b-form-invalid-feedback :state="lockedHoursValidation">
            Locked hours should be a non-negative integer number.
          </b-form-invalid-feedback>
          <json-viewer
          class="mt-3"
          :value="newManifest"
          :expand-depth=1
          copyable
          sort></json-viewer>
          <div class="mt-3 manifest-btn-wrapper">
            <b-button type="submit" class="btn-danger btn-modal rounded-pill" variant="primary">Upload manifest</b-button>
          </div>
        </b-form>
        <template #modal-footer >
          <div>
          </div>
          </template>
        </b-modal>
        <b-modal id="missing-wallet-modal" title="Please load your wallet" size="xl" >
          Please install an Arweave wallet extension to your browser, load your Arweave wallet and try again. We recommend using 
          <a target="_blank" href="https://chrome.google.com/webstore/detail/arconnect/einnioafmpimabjcddiinlhmijaionap">ArConnect</a>.
          <template #modal-footer><div></div></template>
        </b-modal>
        <b-modal id="mining-transaction" title="Transaction status" size="xl" ok-only>
          <div>
            Your manifest is being mined into Arweave blockchain. This can take a couple of minutes.
          </div>
        </b-modal>
    </div>  
  </div>
</template>

<script>
import JsonViewer from 'vue-json-viewer'
import Arweave from 'arweave';

const {interactWrite} = require("smartweave");

export default {
  name: "Provider",

  props: {
    manifests: Array
  },

  data() {
    return {
      newManifest: "",
      newManifestData: {},
      fields: [
        'manifestTxId',
        'changeMessage', 
        'uploadDate', 
        'status',
        { key: 'actions', label: ''}
      ],
      manifestsDataForTable: [],
      contractId: "CbGCxBJn6jLeezqDl1w3o8oCSeRCb-MmtZNKPodla-0",
      manifestChangeMessage: "",
      manifestLockedHours: 0 
    }; 
  },

  mounted() {
    this.getManifestsData();
  },

  methods: {
    onSubmit(event) {
      event.preventDefault();
      this.uploadManifest();
    },
    uploadManifest() {
      if (window.arweaveWallet) {
        this.uploadToArweave();
      } else {
        this.$bvModal.show('missing-wallet-modal');
      }
    },

    async uploadToArweave() {
      this.$bvModal.hide('manifest-modal');
      this.$bvModal.show('mining-transaction');

      await window.arweaveWallet.connect(['ACCESS_ADDRESS']);

      const arweave = Arweave.init({
        host: "arweave.net",
        protocol: "https",
        port: 443,
      });

      const providerId = await window.arweaveWallet.getActiveAddress();

      //TODO: make a real check
      if (await this.checkAdminPriviliges(providerId, arweave)) {
        const dataTransaction = await arweave.createTransaction({data: JSON.stringify(this.newManifest)});
        await arweave.transactions.sign(dataTransaction)
        await arweave.transactions.post(dataTransaction)

        let jsonUploadTxId =  dataTransaction.id;

        const uploadedManifestData = 
        {
          changeMessage: this.manifestChangeMessage,
          manifestTxId: jsonUploadTxId,
          lockedHours: this.manifestLockedHours,
          manifest: this.newManifest,
          uploadDate: (new Date()).toLocaleDateString("en-GB")
        };

        sessionStorage.setItem('minedManifest', JSON.stringify(uploadedManifestData));
        this.getManifestsData();

        const resultManifestUpload = await interactWrite(
            arweave, 
            'use_wallet', 
            this.contractId,
          {
            function: "addProviderManifest",
            data: {
              providerId: providerId,
              manifestData: uploadedManifestData
            }
          });
      }
    },

    async checkAdminPriviliges(walletId, arweave) {
      return true;
    },

  //   async waitForConfirmation (transactionId, arweave) {
  //     const statusAfterMine = await arweave.transactions.getStatus(transactionId);

  //     if (statusAfterMine.confirmed === null) {
  //       console.log(`Transaction ${transactionId} not yet confirmed. Waiting another 30 seconds before next check.`);
  //       setTimeout(() => {
  //         this.waitForConfirmation(transactionId, arweave);
  //       }, 10000);
  //     } else {
  //       console.log(`Transaction ${transactionId} confirmed`, statusAfterMine);
  //       return statusAfterMine;
  //     }
  // },

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

      const minedManifest = JSON.parse(sessionStorage.getItem('minedManifest'));

      if (minedManifest && minedManifest.manifestTxId) {
        const manifestAlreadyMined = 
          this.manifests.some(
            manifest => {
              return manifest.manifestTxId === minedManifest.manifestTxId;
            });

        if (manifestAlreadyMined) {
          sessionStorage.removeItem('minedManifest');
        } else {
          this.manifestsDataForTable.push(
            {
              ...minedManifest,
              status: 'mining'
            });
        }
      }

      this.manifestsDataForTable.forEach(
        async (manifest, index) => {
          if (manifest.status !== 'mining') {
            let time = await this.transactionTime(manifest.manifestTxId);
            this.manifestsDataForTable[index].uploadDate = time;
            this.$refs.table.refresh();
          }
        }
      )
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

    lockedHoursValidation() {
      return this.manifestLockedHours && parseInt(this.manifestLockedHours) > 0;
    }
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
  font-size: $font-size-index;
  font-weight: $font-weight-semi-bold;
  color: $white;
  text-transform: uppercase;
  height: 20px;
  border-radius: 10px;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 4px;

  &.active {
    background-color: $teal;
  }

  &.mining {
    background-color: $yellow;
  }
}

#message-input, #locked-hours-input {
  width: 50%;
}

.manifest-btn-wrapper {
  display: flex;
  flex-direction: row-reverse;
}

</style>

<style>
.provider-manifests .manifest-list tr:not(.b-table-details) {
  cursor: pointer;
}
</style>
