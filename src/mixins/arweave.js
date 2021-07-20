import Arweave from 'arweave';
import constants from "@/constants";
import dummyWallet from '@/dummy-wallet.json';
const {interactRead} = require("smartweave");

export default {
  data() {
    return {
      arweaveObj: null,
      registryContractId: null,
      kyvePoolId: constants.kyvePoolId
    }
  },
  methods: {
    arweaveInit() {
      return Arweave.init({
        host: "dh48zl0solow5.cloudfront.net",
        protocol: "https",
        port: 443,
      });
    },
    getTransaction(transactionId) {
      return this.arweave.transactions.get(transactionId);
    },
    transactionTime(id) {
      return fetch(`https://dh48zl0solow5.cloudfront.net/tx/${id}/status`)
        .then(
          response => {
            return response.json()
          })
        .then(
          status => {
            return fetch(`https://dh48zl0solow5.cloudfront.net/block/hash/${status.block_indep_hash}`);
          })
        .then(
          response => {
            return response.json()
          })
        .then(
          blockInfo => {
            return new Date(blockInfo.timestamp * 1000);
          }
        )
    },
    async providersRegistryContractId() {
      if (this.registryContractId) {
        return this.registryContractId;
      } else {
        let contractRegistryData = await interactRead(
          this.arweave, 
          dummyWallet,
          constants.contractsRegistryContractId,
          {
            function: "contractsCurrentTxId",
            data: {
              contractNames: ['providers-registry']
            }
          }
        );
        this.registryContractId = contractRegistryData['providers-registry'];
        return this.registryContractId;
      }
      // for testing
      // return "CbGCxBJn6jLeezqDl1w3o8oCSeRCb-MmtZNKPodla-0";
    }
  },
  computed: {
    arweave() {
      if (!this.arweaveObj) {
        this.arweaveObj = this.arweaveInit();
      }
      return this.arweaveObj;
    }
  }
};
