import {
    ContractInteractionsLoader,
  } from 'smartweave/lib/v2';

export default class LocalStorageContractInteractionsLoader extends ContractInteractionsLoader {
    constructor(arweave) {
        super(arweave);

        try {
            const uid = new Date;
            (this.storage = window.localStorage).setItem(uid, uid);
            const fail = this.storage.getItem(uid) != uid;
            this.storage.removeItem(uid);
            fail && (this.storage = false);
        } catch (exception) {
            console.log('Local storage is not supported by current environment')
        }

        this.prefix = "_REDSTONE_APP_INTERACTIONS_"
    }


    sideEffect = fn => d => {
        fn(d)
        return d;
      };

    load(contractTxId, blockHeight) {
        
        const cached = this.getItem(contractTxId, blockHeight);

        if (cached) {
            console.log('getting cached interactions')
            return cached;
        } else {
            console.log('loading interactions')

            return super.load(contractTxId, blockHeight).then(
                res => {
                    this.setItem(contractTxId, blockHeight, res)

                    return res;
                }
            );
        }
    }

    getItem(contractTxId, blockHeight) {
        return this.storage.getItem(this.prefixed(contractTxId), contractTxId) ? JSON.parse(this.storage.getItem(this.prefixed(contractTxId), contractTxId))[blockHeight] : null;
    }

    setItem(contractTxId, blockHeight, resp) {
        let data = JSON.parse(this.storage.getItem(this.prefixed(contractTxId)));

        if (data == null) {
            data = {}
        }

        data[blockHeight] = resp;

        this.storage.setItem(this.prefixed(contractTxId), JSON.stringify(data))
    }

    prefixed(key) {
        return this.prefix + key;
    }
}
