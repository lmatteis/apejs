/**
 * Just a small wrapper around Google App Engine
 * low-level datastore api
 */
importPackage(com.google.appengine.api.datastore);

var googlestore = (function(){

    // syntax sugar
    var filterOperators = {
        '<' : 'LESS_THAN',
        '<=': 'LESS_THAN_OR_EQUAL',
        '=' : 'EQUAL',
        '>' : 'GREATER_THAN',
        '>=': 'GREATER_THAN_OR_EQUAL',
        '!=': 'NOT_EQUAL'
    };

    var sortDirections = {
        'ASC' : 'ASCENDING',
        'DESC': 'DESCENDING'
    };

    return {
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
        del: function(key) {
            this.datastore["delete"](key);
        },
        query: function(kind) {
            var q = new Query(kind);
            var options = FetchOptions.Builder;
            var self;
            function addFilter(propertyName, operator, value) {
                operator = filterOperators[operator] || operator;
                q.addFilter(propertyName, Query.FilterOperator[operator], value);
                return self;
            }
            function addSort(propertyName, direction) {
                direction = sortDirections[direction||"ASC"] || direction;
                q.addSort(propertyName, Query.SortDirection[direction]);
                return self;
            }
            function withLimit(num) {
                options = options.withLimit(num);
                return self;
            }
            function fetch(num) {
                if (num) withLimit(num);
                var preparedQuery = googlestore.datastore.prepare(q);
                return preparedQuery.asList(options).toArray();
            }
            function count() {
                var preparedQuery = googlestore.datastore.prepare(q);
                return preparedQuery.countEntities(options);
            }
            return self = {
                filter : addFilter,
                sort   : addSort,
                limit  : withLimit,
                fetch  : fetch,
                count  : count
            };
        },
        // abstracting everything as possible
        createKey: function(kind, id) {
            return KeyFactory.createKey(kind, id);
        }
    };
})();