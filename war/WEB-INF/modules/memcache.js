importPackage(com.google.appengine.api.memcache);

var memcache = {
    memcacheService: MemcacheServiceFactory.getMemcacheService(),
    get: function(key) {
        return this.memcacheService.get(key);
    },
    put: function(key, value) {
        return this.memcacheService.put(key, value);
    },
    clearAll: function() {
        this.memcacheService.clearAll();
    }
};
