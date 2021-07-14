<template>
  <div class="provider-manifests">
    <div class="manifest-list">
      <b-table
        ref="table"
        id="assets-table"
        stacked="md"
        hover
        :sort-by="'id'"
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
            {{ data.item.uploadDate | date }}
          </template>

          <template #cell(status)="data">
            <label v-if="data.item.status" :class="'manifest-status ' + data.item.status">{{ data.item.status }}</label>
          </template>

          <template #cell(actions)="data">
            <i v-if="!data.item._showDetails" class="fa fa-chevron-down" />
            <i v-else class="fa fa-chevron-up" />
          </template>

          <template slot="row-details" slot-scope="data">
              <b-button v-on:click="initNewManifest(data.item)" id="import" class="btn-danger btn-modal rounded-pill mr-3 mb-3" variant="primary">Use as template</b-button>
              <b-button v-on:click="setActive(data.item)" id="import" class="btn-danger btn-modal rounded-pill mb-3" variant="primary">Set active</b-button>
              <json-viewer
                :value="data.item.manifestData"
                :expand-depth=1
                copyable
                sort></json-viewer>
          </template>
      </b-table>
    </div> 
    <b-modal id="upload-new-modal" title="Upload new manifest" size="xl" class="upload-new-manifest-modal">
      <div class="d-flex flex-column align-items-center">
        <div>You can either upload manifest from a JSON file...</div>
        <b-button v-on:click="loadFile();$bvModal.hide('upload-new-modal');" id="import" class="btn-danger btn-modal rounded-pill" variant="primary">Upload</b-button>
        <div class="mt-5">...or start with an empty template</div>
        <b-button v-on:click="initNewManifest();$bvModal.hide('upload-new-modal');" id="start-empty" class="btn-danger btn-modal rounded-pill" variant="primary">Start</b-button>    
      </div>  
      <template #modal-footer><div></div></template>
    </b-modal>

    <div class="upload-wrapper">
      <b-button v-on:click="$bvModal.show('upload-new-modal')" id="upload" class="btn-danger btn-modal rounded-pill" variant="primary">Create new</b-button>
      <input type="file" id="manifest-upload" class="manifest-input" accept="application/JSON" @input="fileUploaded"/>
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
        <template #modal-footer ><div></div></template>
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
    <ManifestForm :initialManifest="templateManifest" v-if="showManifestForm"/>
  </div>
</template>

<script>
import JsonViewer from 'vue-json-viewer'
const axios = require('axios');
import ManifestForm from "./ManifestForm.vue";
import { interactWrite } from 'smartweave';

export default {
  name: "Manifests",

  props: {
    provider: {}
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
      manifestsDataForTable: [],
      manifestChangeMessage: "",
      manifestLockedHours: 0,
      showManifestForm: false,
      templateManifest: {} 
    }; 
  },

  mounted() {
    this.$root.$on('manifestFormClosed', () => {
      this.templateManifest = {};
      this.showManifestForm = false;
    });
    this.$root.$on('manifestSubmitted', (manifest) => {
      this.showManifestForm = false;
      this.uploadManifest(manifest); 
    });
    this.getManifestsData();
  },

  methods: {
    onSubmit(event) {
      event.preventDefault();
      this.uploadManifest();
    },
    uploadManifest(manifest) {
      if (window.arweaveWallet) {
        this.uploadToArweave(manifest);
      } else {
        this.$bvModal.show('missing-wallet-modal');
      }
    },
    initNewManifest(manifest) {
      this.templateManifest = manifest;
      this.showManifestForm = true;
    },
    async uploadToArweave(manifest) {
      this.$bvModal.hide('manifest-modal');
      this.$bvModal.show('mining-transaction');

      await window.arweaveWallet.connect(['ACCESS_ADDRESS']);

      const userId = await window.arweaveWallet.getActiveAddress();

      //TODO: make a real check
      if (await this.checkAdminPriviliges(userId, this.arweave)) {
        const dataTransaction = await this.arweave.createTransaction({data: JSON.stringify(manifest)});
        await this.arweave.transactions.sign(dataTransaction)
        await this.arweave.transactions.post(dataTransaction)

        let jsonUploadTxId =  dataTransaction.id;

        console.log('jsonUploadTxId: ', jsonUploadTxId);

        this.waitForConfirmation(jsonUploadTxId, this.arweave).then(() => {});

        const uploadedManifestData = 
        {
          changeMessage: this.manifestChangeMessage,
          manifestTxId: jsonUploadTxId
        };

        sessionStorage.setItem('minedManifest', JSON.stringify({ ...uploadedManifestData, manifest: manifest, uploadDate: new Date()}));
        this.getManifestsData();

        let newManifestTxId = await interactWrite(
            this.arweave, 
            'use_wallet', 
            await this.providersRegistryContractId(),
          {
            function: "addProviderManifest",
            data: {
              providerId: this.providerId,
              manifestData: uploadedManifestData,
              lockedHours: this.manifestLockedHours
            }
          }
        );

        this.waitForConfirmation(newManifestTxId, this.arweave).then(() => {});

        console.log('newManifestTxId: ', newManifestTxId);
      }
    },

    async waitForConfirmation(transactionId, arweave) {
      const statusAfterMine = await arweave.transactions.getStatus(transactionId);

      if (statusAfterMine.confirmed === null) {
        console.log(`Transaction ${transactionId} not yet confirmed. Waiting another 30 seconds before next check.`);
        setTimeout(() => {
          this.waitForConfirmation(transactionId, arweave);
        }, 30000);
      } else {
        console.log(`Transaction ${transactionId} confirmed`, statusAfterMine);
        return statusAfterMine;
      }
    },

    async checkAdminPriviliges(userId, arweave) {
      // const admins = await interactRead(
      //     arweave, 
      //     'use_wallet', 
      //     await this.providersRegistryContractId(),
      //   {
      //     function: "providerAdmins",
      //     data: {
      //       providerId: this.provider.providerId
      //     }
      //   }
      // );
      // return admins.includes(providerId);
      return true;
    },

    async getManifestsData() {
      this.manifestsDataForTable = [];
      this.provider.manifests.slice().reverse()
        .forEach(
          (manifest, index) => {
            axios.get(`https://arweave.net/tx/${manifest.manifestTxId}/data.json`).then(
              async fetchedManifest => {
                const uploadDate = await this.transactionTime(manifest.manifestTxId);
                this.manifestsDataForTable.push({
                  id: index,
                  manifestTxId: manifest.manifestTxId,
                  changeMessage: manifest.changeMessage,
                  manifestData: fetchedManifest.data,
                  uploadBlockHeight: manifest.uploadBlockHeight,
                  uploadDate: uploadDate,
                  status: index == 0 ? 'active' : '',
                  _showDetails: false
                })
              }
          )}
        );

      const minedManifest = JSON.parse(sessionStorage.getItem('minedManifest'));

      if (minedManifest && minedManifest.manifestTxId) {
        const manifestAlreadyMined = 
          this.provider.manifests.some(
            manifest => {
              return manifest.manifestTxId === minedManifest.manifestTxId;
            });

        if (manifestAlreadyMined) {
          sessionStorage.removeItem('minedManifest');
        } else {
          this.manifestsDataForTable.unshift(
            {
              ...minedManifest,
              status: 'mining'
            });
        }
      }
    },

    loadFile() {
      document.getElementById('manifest-upload').value = "";
      document.getElementById('manifest-upload').click();
    },

    fileUploaded() {
      let file = document.getElementById('manifest-upload').files[0];

      var fr = new FileReader();

      fr.onload = function(e) { 
        this.initNewManifest(
          {
            manifestData: JSON.parse(e.target.result)
          }
        );
      }.bind(this)

      fr.readAsText(file);
    },

    rowClicked(record) {
      this.$set(record, '_showDetails', !record._showDetails)
    },
  },

  components: {
    JsonViewer,
    ManifestForm  
  },

  computed: {
    getManifest(id) {
      return this.manifests.find(el => el.manifestTxId === id);
    },

    lockedHoursValidation() {
      return parseInt(this.manifestLockedHours) >= 0;
    },

    providerId() {
      return this.$route.params.id;
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
