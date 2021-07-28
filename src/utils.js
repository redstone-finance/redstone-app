import constants from "@/constants";

export default {
    transactionTime(id) {
        return fetch(`https://${constants.arweaveUrl}/tx/${id}/status`)
            .then(
            response => {
                return response.json()
            })
            .then(
            status => {
                return fetch(`https://${constants.arweaveUrl}/block/hash/${status.block_indep_hash}`);
            })
            .then(
            response => {
                return response.json()
            })
            .then(
            blockInfo => {
                return new Date(blockInfo.timestamp * 1000);
            });
    },
    activeFrom(transactionTime, lockedHours) {
        return new Date(transactionTime.getTime() + lockedHours * 60 * 60 * 1000);
    },
    dataPoints(interval, activeFrom) {
        return interval ? Math.floor((new Date().getTime() - activeFrom.getTime()) / interval): 0;
    } 
}