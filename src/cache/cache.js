export default class LocalStorageCache {
    constructor() {
        try {
            const uid = new Date;
            (this.storage = window.localStorage).setItem(uid, uid);
            const fail = this.storage.getItem(uid) != uid;
            this.storage.removeItem(uid);
            fail && (this.storage = false);
        } catch (exception) {
            console.log('Local storage is not supported by current environment')
        }
        this.prefix = "_REDSTONE_APP_"
    }
    clearAll() {
        Object.keys(this.storage).forEach(
            key => {
                this.storage.removeItem(this.prefixed(key))
            }
        );
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

