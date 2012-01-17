importPackage(com.google.appengine.api.memcache);

var memcache = {
    memcacheService: MemcacheServiceFactory.getMemcacheService(),
    get: function(key) {
        return this.memcacheService.get(key);
    },
    /**
     * key: the string you want to identify this cache item with
     * value: the value stored in the cache (can be object or other types)
     * seconds: after how many seconds this cache will expire
     */
    put: function(key, value, seconds) {
        return this.memcacheService.put(key, value, Expiration.byDeltaSeconds(seconds));
    },
    clearAll: function() {
        this.memcacheService.clearAll();
    }
};
exports = memcache;
