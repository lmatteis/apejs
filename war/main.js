require("apejs.js");
require("googlestore.js");

// we want to do something before, or after
var index = {
    get: function(request, response) {
        var print = printer(response);
        try {
            // you can pass any printer function to an included file
            // it can be a real print with access to the output,
            // or a simple buffer that is handled from the parent file
            require("./skins/index.js", { "print": print });
        } catch (e) {
            response.getWriter().println(e.getMessage());
        }
    },
    post: function(request, response) {
        var person = googlestore.entity("Person", {
            "name"  : request.getParameter("name"),
            "gender": request.getParameter("gender"),
            "age":    parseInt(request.getParameter("age"), 10)
        });
        // FIXME - abstract put so it uses transactions
        googlestore.put(person);
        response.sendRedirect("/");
    }
};
var test = {
    get: function(request, response) {
        try {
            var print = printer(response);
            print("<h1>Filtering and sorting</h1>");
            print(render("./skins/form.html"));
            var people = googlestore.query("Person").fetch();
            people.forEach(function(person){
                require("./skins/person.js", {
                    "print" : print,
                    "person": person
                });
            });
        } catch (e) {
            response.getWriter().println(e.getMessage());
        }
    },
    post: function(request, response) {
        try {
            var param = request.getParameter.bind(request);
            var print = printer(response);

            print("<h1>Filtering and sorting</h1>");
            print(render("./skins/form.html"));

            // filter value can be string or number
            var filter_val = parseInt(param("filter_val"), 10);
            if (typeof filter_val != 'number') {
                filter_val = param("filter_val");
            }

            // select...
            var people = googlestore.query("Person")
                .filter(param("filter_by"), param("filter_op"), filter_val)
                .sort(param("filter_by"))
                .sort(param("sort_by"), param("sort_dir"))
                .fetch();

            // ...and list people
            people.forEach(function(person){
                require("./skins/person.js", {
                    "print" : print,
                    "person": person
                });
            });
            
            // Error message for empty result set
            if (!people.length) {
              print("No match.");
            }
        } catch (e) {
            response.getWriter().println(e.getMessage());
        }
    }
};

var person = {
    get: function(request, response, matches) {
        var id     = parseInt(matches[1], 10);
        var key    = googlestore.createKey("Person", id);
        var person = googlestore.get(key);
        require("./skins/person.js", {
                "print" : printer(response),
                "person": person
        });
    }
};

var del = {
    get: function(request, response, matches) {
        var id  = parseInt(matches[1], 10);
        var key = googlestore.createKey("Person", id);
        googlestore.del(key);
        response.sendRedirect("/");
    }
}

apejs.urls = {
    "/": index,
    "/test" : test,
    "/person/([a-zA-Z0-9_]+)" : person,
    "/delete/([0-9]+)" : del
};


// simple syntax sugar
function printer(response) {
    var writer = response.getWriter();
    return writer.print.bind(writer);
}
