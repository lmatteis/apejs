/**
 * Just a small wrapper around Google App Engine
 * low-level datastore api
 */
importPackage(com.google.appengine.api.datastore);

var googlestore = {
    datastore: DatastoreServiceFactory.getDatastoreService(),

    // creates a new entity
    entity: function(kind, keyName, data) {
        var entity = new Entity(kind, keyName);
        for(var i in data) {
            entity.setProperty(i, data[i]);
        }
        return entity;
    },
    // mimics JDO functionality
    getObjectById: function(kind, keyName) {
        var key = KeyFactory.createKey(kind, keyName);
        var entity = this.datastore.get(key);
        return entity;
    },
    query: function(kind) {
        var q = new Query(kind);
        var preparedQuery = this.datastore.prepare(q);

        return preparedQuery.asList(FetchOptions.Builder.withLimit(5)).toArray();
    }
};
