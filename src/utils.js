import constants from "@/constants";

export default {
    async transactionTime(id) {
        const status = await (await fetch(`https://${constants.arweaveUrl}/tx/${id}/status`)).json();
        const blockInfo = await (await fetch(`https://${constants.arweaveUrl}/block/hash/${status.block_indep_hash}`)).json();
        return new Date(blockInfo.timestamp * 1000);
    },
    activeFrom(transactionTime, lockedHours) {
        return new Date(transactionTime.getTime() + lockedHours * 60 * 60 * 1000);
    },
    dataPoints(interval, activeFrom) {
        return interval ? Math.floor((new Date().getTime() - activeFrom.getTime()) / interval): 0;
    },
    getViewblockTxLink(txId) {
        return constants.viewblockTxUrlPrefix + txId;
    },
    initLocalStorage() {
        try {
            let storage;
            const uid = new Date;
            (storage = window.localStorage).setItem(uid, uid);
            const fail = storage.getItem(uid) != uid;
            if (fail) throw new Error();
            storage.removeItem(uid);
            return storage;
        } catch (exception) {
            throw 'Local storage is not supported by current environment';
        }
    }
}
