require("apejs.js");
require("googlestore.js");

var index = {
    get: function(request, response) {
        var alice = googlestore.entity("Person", "Miky", {
            "gender": "female",
            "eyecolor": "green"
        });

        googlestore.datastore.put(alice);
        
        response.getWriter().println("done");
    }
};

var test = {
    get: function(request, response) {
        try {
            var miky = googlestore.getObjectById("Person", "Miky");
            
            require("index.js", {
                "aliceAge": miky.getProperty("eyecolor") 
            });
            response.getWriter().println(skin);
        } catch (e) {
            response.getWriter().println(e.getMessage());
        }
    }
};

apejs.urls = {
    "/": index,
    "/test" : test
};
