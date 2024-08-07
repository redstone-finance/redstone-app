import constants from '@/constants'

export default {
  async transactionTime(id) {
    const status = await (await fetch(`https://${constants.arweaveUrl}/tx/${id}/status`)).json()
    const blockInfo = await (
      await fetch(`https://${constants.arweaveUrl}/block/hash/${status.block_indep_hash}`)
    ).json()
    return new Date(blockInfo.timestamp * 1000)
  },
  activeFrom(transactionTime, lockedHours) {
    return new Date(transactionTime.getTime() + lockedHours * 60 * 60 * 1000)
  },
  dataPoints(provider, interval, pointsPerInterval) {
    const snapshotTimestamp = 1630398567000
    const providersSnapshots = {
      'I-5rWUehEv-MjdK9gFw09RxfSLQX9DIHxG614Wf8qo0': 186202711,
      zYqPZuALSPa_f5Agvf8g2JHv94cqMn9aBtnH7GFHbuA: 76653111,
      Yba8IVc_01bFxutKNJAZ7CmTD5AVi2GcWXf1NajPAsc: 6544514,
    }

    let providerSnapshot = providersSnapshots[provider]

    return interval
      ? providerSnapshot +
          Math.floor(pointsPerInterval * ((new Date().getTime() - snapshotTimestamp) / interval))
      : 0
  },
  getViewblockTxLink(txId) {
    return constants.viewblockTxUrlPrefix + txId
  },
  getViewblockAddressLink(address) {
    return constants.viewblockAddressUrlPrefix + address
  },
  initLocalStorage() {
    try {
      let storage
      const uid = new Date()
      ;(storage = window.localStorage).setItem(uid, uid)
      const fail = storage.getItem(uid) != uid
      if (fail) throw new Error()
      storage.removeItem(uid)
      return storage
    } catch (exception) {
      throw 'Local storage is not supported by current environment'
    }
  },
}
