importPackage(com.google.appengine.api.datastore);

/**
 * The main `select()` function. Use `select("kind")` to start the chain.
 *
 * @param {String} the string kind of the datastore entity we're interacting with
 */
var select = function(kind) {
    return select.fn.init(kind);
};
select.fn = {
    init: function(kind) {
        this.datastore = DatastoreServiceFactory.getDatastoreService();
        this.kind = kind;
        this.query = false;
        this.options = false;
        this.fetchOptions = FetchOptions.Builder.withDefaults();

        this.filterOperators = {
            '<' : 'LESS_THAN',
            '<=': 'LESS_THAN_OR_EQUAL',
            '=' : 'EQUAL',
            '>' : 'GREATER_THAN',
            '>=': 'GREATER_THAN_OR_EQUAL',
            '!=': 'NOT_EQUAL'
        };

        this.sortDirections = {
            'ASC' : 'ASCENDING',
            'DESC': 'DESCENDING'
        };
        return this;
    },
    /**
     * Add a new record to the database.
     *
     *      select('users').
     *        add({ name: 'Bill Adama' });
     *
     * @param {Object} record An object containing values for a new record in the collection.
     */
    add: function(record) {
        var entity = new Entity(this.kind);
        for(var key in record) {
            this.setProperty(entity, key, record[key]);
        }
        this.datastore.put(entity);
    },
    /**
     * Modify attributes.
     *
     *      select('users').
     *        find(1).
     *        attr({ name: 'William Adama' });
     *
     * @param {Object} record An object containing values for a new record in the collection.
     * @returns {Object} The current `select` object
    */
    attr: function(record) {
        var result = this.getResult();
        for(var i=0; i<result.length; i++) {
            var entity = result[i];
            for(var key in record) {
                this.setProperty(entity, key, record[key]);
            }
            // XXX should do bulk update
            this.datastore.put(entity);
        }
    },

    /**
     * Limit the next database find query.
     *
     * @param {Number} limit Limits the next find() by this amount
     * @returns {Object} The current `select` object
     */
    limit: function(limit) {
        if(limit) this.fetchOptions = this.fetchOptions.limit(limit);
        return this;
    },
    /**
     * Offset the next database find query.
     *
     * @param {Number} offset Offset the next find() by this amount
     * @returns {Object} The current `select` object
     */
    offset: function(offset) {
        if(offset) this.fetchOptions = this.fetchOptions.offset(offset);
        return this;
    },

    /**
     * Sorts the results of the next find.
     *
     *      select('users').
     *        find().
     *        sort('name', 'ASC').
     *        each(function() { console.log(this); });
     *
     * @param {String} propertyName - the property to which to sort on
     * @param {String} direction - either "ASC" or "DESC"
     * @returns {Object} The current `select` object
     */
    sort: function(propertyName, direction) {
        if(this.query) {
            direction = this.sortDirections[direction||"ASC"] || direction;
            this.query.addSort(propertyName, Query.SortDirection[direction]);
        }
        return this;
    },

    /**
     * Find records.
     *
     * Find based on ID:
     *      select('users').
     *        find(1).
     *        each(function() { console.log(this); });
     *
     * Find based on attributes:
     *      select('users').
     *        find({ type: 'admin' }).
     *        each(function() { console.log(this); });
     *
     * @returns {Object} The current `select` object
     */
    find: function(options, fn) {
        this.options = options;
        if(typeof this.options === "object" || !this.options) {
            // start a query, cuz we know it's not a single value
            this.query = new Query(this.kind);
        }
        return this;
    },
    /**
     * Causes the previous `find()` to run, and iterates over the result.
     * In the passed in callback, `this` will refer to each value.
     *
     *      select('users').
     *        find().
     *        sort('name').
     *        each(function(id) { console.log(this); });
     *
     * @param {Function} fn A callback that will be run for each value
     * @returns {Object} The current `select` object
     */
    each: function(fn) {
        var result = this.getResult();

        for(var i=0; i<result.length; i++) {
            var ent = result[i];
            fn.call(this.toJS(ent), ent.getKey().getId());
        }
    },

    /**
     * Delete the current set of values specificed by `.find()`
     *      
     *      select("users").find({ type: "trial" }).del();
     *
     */
    del: function() {
        var result = this.getResult();
        for(var i=0; i<result.length; i++) {
            var ent = result[i];
            // XXX should do bulk delete
            this.datastore["delete"](ent.getKey());
        }
    },

    getResult: function() {
        var result = [];
        if(typeof this.options === "number" || typeof this.options === "string") {
            var key = KeyFactory.createKey(this.kind, this.options); 
            var entity = this.datastore.get(key);

            result.push(entity);
        } else if (this.query) {
            for(var x in this.options) {
                var operator = this.filterOperators["="];
                this.query.addFilter(x, Query.FilterOperator[operator], this.options[x]);
            }
            var preparedQuery = this.datastore.prepare(this.query);
            result = preparedQuery.asList(this.fetchOptions).toArray();
        }
        return result;
    },

    /**
     * Transforms an entity into a nice
     * JavaScript object ready to be stringified
     * so we don't have to call getProperty() all the time.
     * this should be more generic. only supports values
     * that are directly convertable into strings
     * otherwise JSON won't show them.
     *
     * This should be private :(
     *
     * Also should convert all these types: http://code.google.com/appengine/docs/java/datastore/entities.html#Properties_and_Value_Types
     */
    toJS: function(entity) {
        var properties = entity.getProperties(),
            entries = properties.entrySet().iterator();

        var ret = {};
        while(entries.hasNext()) {
            var entry = entries.next(),
                key = entry.getKey(),
                value = entry.getValue();

            if(value instanceof com.google.appengine.api.blobstore.BlobKey) {
                // get metadata
                var blobInfo = new BlobInfoFactory().loadBlobInfo(value),
                    contentType = blobInfo.getContentType();
                // based on the mime type we need to figure out which image to show
                if(!contentType.startsWith("image")) { // default to plain text
                    value = "<a target='_blank' href='/serve/"+value.getKeyString()+"'>"+blobInfo.getFilename()+"</a>";
                } else {
                    value = "<a target='_blank' href='/serve/"+value.getKeyString()+"'><img src='/serve/"+value.getKeyString()+"' /></a>";
                }
            } else if(value instanceof Text) {
                value = value.getValue();
            }

            if(value instanceof java.util.List) {
                // this is how we convert Java Lists into JavaScript native arrays
                ret[key] = org.mozilla.javascript.NativeArray(value.toArray());
            } else {
                // putting an empty string in front of it
                // casts it to a JavaScript string even if it's
                // more of a complicated type
                ret[key] = ""+value;
            }

            // always try to parse this string to see if it's valid JSON
            try {
                if(typeof ret[key] === "string")
                    ret[key] = JSON.parse(value);
            } catch(e) {
              // not valid JSON - don't do anything
            }
        }

        return ret;
    },
    setProperty: function(entity, key, value) {
        // google's datastore doesn't like native arrays.
        // it needs a Collection for properties with
        // multiple values
        if(this.isArray(value)) {
            value = java.util.Arrays.asList(value);
        } else if(this.isObject(value)) {
            value = JSON.stringify(value);
        }
        /*
        if(value instanceof java.lang.String || typeof value === "string") {
            value = new Text(value);
        }
        */
        entity.setProperty(key, value);
    },
    isArray: function( obj ) {
        return toString.call(obj) === "[object Array]";
    },
    isObject: function( obj ) {
        return toString.call(obj) === "[object Object]";
    } 
};
exports = select;
