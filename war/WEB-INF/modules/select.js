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
        this.results = [];

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
        for(var i in record) {
            // google's datastore doesn't like native arrays.
            // it needs a Collection for properties with
            // multiple values
            if(record[i] instanceof Array)
                record[i] = java.util.Arrays.asList(record[i]);

            entity.setProperty(i, record[i]);
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
    //attr: function(record) {

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
        direction = this.sortDirections[direction||"ASC"] || direction;
        this.query.addSort(propertyName, Query.SortDirection[direction]);
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
     * Causes the previous `find()` to run, and iterates over the results.
     * In the passed in callback, `this` will refer to each value.
     *
     *      select('users').
     *        find().
     *        sort('name').
     *        each(function() { console.log(this); });
     *
     * @param {Function} fn A callback that will be run for each value
     * @returns {Object} The current `select` object
     */
    each: function(fn) {
        if(typeof this.options === "number" || typeof this.options === "string") {
            var key = KeyFactory.createKey(this.kind, this.options); 
            var entity = this.datastore.get(key);

            this.results.push(entity);
        } else if (this.query) {
            for(var x in this.options) {
                var operator = this.filterOperators["="];
                this.query.addFilter(x, Query.FilterOperator[operator], this.options[x]);
            }
            var preparedQuery = this.datastore.prepare(this.query);
            this.results = preparedQuery.asList(this.fetchOptions).toArray();
        }

        for(var i=0; i<this.results.length; i++) {
            fn.call(this.results[i]);
        }
    }
};
exports = select;
