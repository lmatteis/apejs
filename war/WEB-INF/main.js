require("apejs.js");
require("googlestore.js");

var index = {
    get: function(request, response) {
        var alice = googlestore.entity("Person", "Miky", {
            "gender": "female",
            "eyecolor": "green"
        });

        // FIXME - abstract put so it uses transactions
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
var all = {
    get: function(request, response) {
        var allPeople = googlestore.query("Person");

        for(var i=0; i<allPeople.length; i++) {
            response.getWriter().println(allPeople[i].getProperty("gender"));
        }

    }
};

apejs.urls = {
    "/": index,
    "/all": all,
    "/test" : test
};
