/**
 * Just a small wrapper around Google App Engine
 * low-level datastore api
 */
importPackage(com.google.appengine.api.datastore);

var googlestore = {
    datastore: DatastoreServiceFactory.getDatastoreService(),

    // creates a new entity
    entity: function() {
        if(arguments.length === 2) {
            var kind = arguments[0],
                data = arguments[1],
                entity = new Entity(kind);
        } else {
            var kind = arguments[0],
                keyName = arguments[1],
                data = arguments[2],
                entity = new Entity(kind, keyName);
        }

        for(var i in data) {
            // google's datastore doesn't like native arrays.
            // it needs a Collection for properties with
            // multiple values
            if(data[i] instanceof Array)
                data[i] = java.util.Arrays.asList(data[i]);
            entity.setProperty(i, data[i]);
        }
        return entity;
    },
    set: function(entity, data) {
        for(var i in data) {
            if(data[i] instanceof Array)
                data[i] = java.util.Arrays.asList(data[i]);
            entity.setProperty(i, data[i]);
        }
    },
    put: function(entity) {
        return this.datastore.put(entity);
    },
    // mimics JDO functionality
    get: function(key) {
        if(!key)
            return null;
        var entity = this.datastore.get(key);
        return entity;
    },
    query: function(kind) {
        var q = new Query(kind);
        function addFilter(propertyName, filter, value) {
            q.addFilter(propertyName, Query.FilterOperator.EQUAL, value);
        }
        function fetch(num) {
            var preparedQuery = googlestore.datastore.prepare(q);
            return preparedQuery.asList(FetchOptions.Builder.withLimit(num)).toArray();
        }
        return {
            addFilter: addFilter,
            fetch: fetch
        };

    },
    // abstracting everything as possible
    createKey: function(kind, id) {
        return KeyFactory.createKey(kind, id);
    }

};
