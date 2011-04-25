require("apejs.js");

importPackage(com.google.appengine.api.datastore);

var index = {
    get: function(request, response) {
        var alice = new Entity("Person", "Alice");
        alice.setProperty("gender", "male");
        alice.setProperty("age", 20);

        var datastore = DatastoreServiceFactory.getDatastoreService();
        datastore.put(alice);
        
        response.getWriter().println("done");
    }
};

var test = {
    get: function(request, response) {
        var aliceKey = KeyFactory.createKey("Person", "Alice");
        var datastore = DatastoreServiceFactory.getDatastoreService();
        try {
            var alice = datastore.get(aliceKey);
            var aliceAge = alice.getProperty("age");
            require("index.js", {
                "aliceAge": aliceAge 
            });
            response.getWriter().println(skin);
        } catch (e) {
            response.sendError(response.SC_NOT_FOUND, "Error fuck");
        }
    }
};

apejs.urls = {
    "/": index,
    "/test" : test
};
