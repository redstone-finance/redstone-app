import utils from "@/utils";

export default class LocalStorageCache {
  constructor(prefix) {
    this.storage = utils.initLocalStorage();

    this.prefix = prefix;
  }
  clearAll() {
    Object.keys(this.storage).forEach((key) => {
      if (key.contains(this.prefix)) {
        this.storage.removeItem(key);
      }
    });
  }
  contains(key) {
    return this.storage.hasOwnProperty(this.prefixed(key));
  }
  get(key) {
    return JSON.parse(this.storage.getItem(this.prefixed(key)));
  }
  put(key, value) {
    this.storage.setItem(this.prefixed(key), JSON.stringify(value));
  }
  remove(key) {
    this.storage.removeItem(this.prefixed(key));
  }

  prefixed(key) {
    return this.prefix + key;
  }
}
