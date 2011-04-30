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
    getObjectByKey: function(kind, keyName) {
        if(!keyName)
            return null;
        var entity = this.datastore.get(keyName);
        return entity;
    },
    query: function(kind) {
        var q = new Query(kind);
        function queryFilter(name, filter, value) {
            q.addFilter(name, Query.FilterOperator.EQUAL, value);
        }
        function result() {
            var preparedQuery = googlestore.datastore.prepare(q);
            return preparedQuery.asList(FetchOptions.Builder.withLimit(5)).toArray();
        }
        return {
            queryFilter: queryFilter,
            result: result
        };

    }
};
