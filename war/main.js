var apejs = require("apejs.js");
var select = require("select.js");

var mustache = require("./common/mustache.js");

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
    "/": {
        get: function(request, response) {
            var people = [];
            select("person").
                find().
                limit(10).
                sort("name", "ASC").
                each(function(id) {
                    people.push({
                        id: id,
                        name: this["name"],
                        age: this["age"]
                    });
                });

            var html = mustache.to_html(render("skins/index.html"), { people: people });
            print(response).text(html);
        },
        post: function(request, response) {
            select('person').
                add({
                    "name"  : request.getParameter("name"),
                    "gender": request.getParameter("gender"),
                    "age":    parseInt(request.getParameter("age"), 10)
                });
            response.sendRedirect("/");
        }
    },
    "/test" : test,
    "/person/([a-zA-Z0-9_]+)" : person,
    "/delete/([0-9]+)" : del
};


// simple syntax sugar
function print(response) {
    return {
        text: function(text) {
            response.getWriter().println(text);
        }
    };
}
