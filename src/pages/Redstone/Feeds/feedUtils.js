
import networks from '@/data/networks.json'
import images from '@/data/logosDefinitions.json'
import { parseUnixTime, hexToDate, getTimeUntilNextHeartbeat } from '@/core/timeHelpers'

export const findNetworkName = (networkId) => {
  return Object.values(networks).find(network => network.chainId === networkId)?.name
}

export const findNetworkImage = (networkId) => {
  return Object.values(networks).find(network => network.chainId === networkId)?.iconUrl
}

export const findExplorer = (networkId) => {
  const network = Object.values(networks).find(network => network.chainId === networkId)
  if (!network) {
    console.warn('Missing explorer for chain:', networkId)
    return null
  }
  return network.explorerUrl
}

export const getFirstPart = (string) => {
  return string.split('/')[0].split('_')[0].split('-')[0]
}

export const getTokenImage = (token) => {
  const idealMatchImg = images.find(image => token === image.token)
  const secondMatch = images.find(image => token.indexOf(image.token) >= 0)
  return idealMatchImg || secondMatch || { name: "placeholder", imageName: "placeholder.png", token: "placeholder" }
}

export const hasSlash = (string) => {
  return string.indexOf('/') >= 0
}

export const stripAdditionalFeedInfo = (string) => {
  const hasUnderscore = string.indexOf('_') >= 0
  const hasDash = string.indexOf('-') >= 0
  if (hasUnderscore) {
    return string.split('_')[0]
  } else if (hasDash) {
    return string.split('-')[0]
  }
  return string
}

export const transformFeed = (item) => {
  return {
    feed: hasSlash(item.feedId) ? stripAdditionalFeedInfo(item.feedId) : stripAdditionalFeedInfo(item.feedId) + '/USD',
    network: { 
      id: item.networkId, 
      name: findNetworkName(item.networkId), 
      image: findNetworkImage(item.networkId), 
    },
    contract_address: item.contractAddress,
    timestamp: { 
      parsed: parseUnixTime(item.timestamp), 
      raw: item.timestamp, 
      date: hexToDate(item.timestamp) 
    },
    layer_id: item.feedId,
    heartbeat: getTimeUntilNextHeartbeat(item?.timestamp, item.triggers.timeSinceLastUpdateInMilliseconds) || JSON.stringify(item.triggers.cron),
    deviation: item.triggers.deviationPercentage ? item.triggers.deviationPercentage + '%' : 'n/a',
    cron: item.triggers.cron,
    token: item.feedId,
    relayerId: item.layerId,
    feed_address: item.feedAddress,
    crypto_token: getFirstPart(item.feedId),
    token_image: getTokenImage(getFirstPart(item.feedId)),
    loaders: item.loaders,
    explorer: findExplorer(item.networkId)
  }
}