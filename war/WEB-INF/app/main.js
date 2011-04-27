require("apejs.js");
require("googlestore.js");

// we want to do something before, or after

var index = {
    get: function(request, response) {
        var allPeople = googlestore.query("Person");
        require("./skins/index.js", {
            "allPeople" : allPeople 
        });
        response.getWriter().println(skin);
    },
    post: function(request, response) {
        var name = request.getParameter("name");
        var alice = googlestore.entity("Person", name, {
            "gender": request.getParameter("gender"),
            "age": request.getParameter("age")
        });

        // FIXME - abstract put so it uses transactions
        googlestore.datastore.put(alice);

        response.sendRedirect("/");

    }
};

var test = {
    get: function(request, response) {
        try {
            var miky = googlestore.getObjectById("Person", "Miky");
            
            require("./skins/index.js", {
                "aliceAge": miky.getProperty("eyecolor") 
            });
            response.getWriter().println(skin);
        } catch (e) {
            response.getWriter().println(e.javaException.getMessage());
        }
    }
};

apejs.urls = {
    "/": index,
    "/test" : test,
    "/recipes/([a-zA-Z0-9_]+)" : {
        get: function(request, response, matches) {
            response.getWriter().println(matches[1]);
        }
    }
};
