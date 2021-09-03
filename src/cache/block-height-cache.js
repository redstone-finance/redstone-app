import utils from "@/utils";

export default class LocalStorageBlockHeightCache {
    constructor(prefix) {
        this.storage = utils.initLocalStorage();

        this.prefix = prefix;
    }
    getLast(key) {
        if (!this.contains(key)) {
            return null;
        }
        const cached = this.getItem(key);
        // sort keys (ie. block heights) in asc order, then reverse and get
        // the first element (ie. highest cached block height).
        const highestBlockHeight = Object.keys(cached).sort().pop();
        return {
            cachedHeight: highestBlockHeight,
            cachedValue: cached[highestBlockHeight]
        };
    }
    getLessOrEqual(key, blockHeight) {
        if (!this.contains(key)) {
            return null;
        }
        const cached = this.getItem(key);
        // find first element in and desc-sorted keys array that is not higher than requested block height
        const highestBlockHeight = Object.keys(cached).sort().reverse().find((cachedBlockHeight) => {
            return cachedBlockHeight <= blockHeight;
        });
        return {
            cachedHeight: highestBlockHeight,
            cachedValue: cached[highestBlockHeight]
        };
    }
    put({ cacheKey, blockHeight }, value) {
        const data = this.contains(cacheKey) ? this.getItem(cacheKey) : {};
        data[blockHeight] = value;
        this.setItem(cacheKey, data);
    }
    contains(key) {
        return this.storage.hasOwnProperty(this.prefixed(key));
    }
    get(key, blockHeight) {
        if (!this.contains(key)) {
            return null;
        }
        if (!this.getItem(key).hasOwnProperty(blockHeight)) {
            return null;
        }
        return {
            cachedHeight: blockHeight,
            cachedValue: this.getItem(key)[blockHeight]
        };
    }
    getItem(key) {
        const cachedKey = this.prefixed(key);
        return JSON.parse(this.storage.getItem(cachedKey));
    }
    setItem(key, data) {
        const cachedKey = this.prefixed(key);
        this.storage.setItem(cachedKey, JSON.stringify(data));
    }
    prefixed(key) {
        return this.prefix + key;
    }
}
