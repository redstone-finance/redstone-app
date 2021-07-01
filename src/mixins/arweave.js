import Arweave from 'arweave';
import constants from "@/constants";
import dummyWallet from '@/dummy-wallet.json';
const {interactRead} = require("smartweave");

export default {
  data() {
    return {
      arweaveObj: null,
      registryContractId: null
    }
  },
  methods: {
    arweaveInit() {
      return Arweave.init({
        host: "arweave.net",
        protocol: "https",
        port: 443,
      });
    },
    getTransaction(transactionId) {
      return this.arweave.transactions.get(transactionId);
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
            return new Date(blockInfo.timestamp * 1000);
          }
        )
    },
    async providersRegistryContractId() {
      if (this.registryContractId) {
        console.log(this.registryContractId)
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
