/**
 * Just a small wrapper around Google App Engine
 * low-level datastore api
 */
importPackage(com.google.appengine.api.datastore);

require("memcache.js");

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
            var options = FetchOptions.Builder.withDefaults();
            var cacheKey = null;
            var self;
            function filter(propertyName, operator, value) {
                operator = filterOperators[operator] || operator;
                q.addFilter(propertyName, Query.FilterOperator[operator], value);
                return self;
            }
            function sort(propertyName, direction) {
                direction = sortDirections[direction||"ASC"] || direction;
                q.addSort(propertyName, Query.SortDirection[direction]);
                return self;
            }
            function setKeysOnly() {
                q.setKeysOnly();
                return self;
            }
            function limit(limit) {
                options = options.limit(limit);
                return self;
            }
            function offset(offset) {
                options = options.offset(offset);
                return self;
            }
            function setCacheKey(key) {
                cacheKey = key;
                return self;
            }
            function fetch(num) {
                if(cacheKey) {
                    var data = memcache.get(cacheKey);
                    if(data) {
                        //log("getting it from cache");
                        return data;
                    }
                }
                //log("getting it from datastore");
                if (num) limit(num);
                var preparedQuery = googlestore.datastore.prepare(q);
                var ret = preparedQuery.asList(options).toArray();
                if(cacheKey)
                    memcache.put(cacheKey, ret);
                return ret;
            }
            function fetchAsIterable(num) {
                if (num) limit(num);
                var preparedQuery = googlestore.datastore.prepare(q);
                return preparedQuery.asIterable(options);
            }
            function count() {
                var preparedQuery = googlestore.datastore.prepare(q);
                return preparedQuery.countEntities(options);
            }
            return self = {
                filter : filter,
                sort   : sort,
                setKeysOnly: setKeysOnly,
                limit  : limit,
                offset : offset,
                setCacheKey: setCacheKey,
                fetch  : fetch,
                fetchAsIterable : fetchAsIterable,
                count  : count
            };
        },
        // abstracting everything as possible
        createKey: function(kind, id) {
            return KeyFactory.createKey(kind, id);
        },

        /**
         * transforms an entity into a nice
         * JavaScript object ready to be stringified
         * so we don't have to call getProperty() all the time.
         * this should be more generic. only supports values
         * that are directly convertable into strings
         * otherwise JSON won't show them
         */
        toJS: function(entity) {
            var properties = entity.getProperties(),
                entries = properties.entrySet().iterator();

            var ret = {};
            while(entries.hasNext()) {
                var entry = entries.next(),
                    key = entry.getKey(),
                    value = entry.getValue();

                if(value instanceof Text)
                    value = value.getValue();

                // putting an empty string in front of it
                // casts it to a JavaScript string even if it's
                // more of a complicated type
                ret[key] = ""+value;
            }

            return ret;
        }

    };
})();
