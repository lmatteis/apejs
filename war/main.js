var apejs = require("apejs.js");
var select = require('select.js');

var mustache = require("./common/mustache.js");

apejs.urls = {
    "/": {
        get: function(request, response, query) {
            var html = mustache.to_html(render("skins/index.html"));
            print(response).html(html);

            select("person")
                .find()
                .sort("name", "ASC")
                .each(function(id) {
                    var person = mustache.to_html(render("skins/person.html"), {
                        id: id,
                        name: this["name"],
                        age: this["age"],
                        gender: this["gender"]
                    });
                    print(response).html(person);
                });
        },
        post: function(request, response, query) {
            select('person')
                .add({
                    "name"  : query.name,
                    "gender": query.gender,
                    "age":    parseInt(query.age, 10),
                    "jobs":   ["fanner", "fut", "fab"],
                    "json":   {"foo":"bar"}
                });
            response.sendRedirect("/");
        }
    },
    "/test" : {
        get: function(request, response) {
            var form = mustache.to_html(render("skins/form.html"));
            print(response).html(form);

            select("person")
                .find()
                .sort("name", "ASC")
                .each(function(id) {
                    var person = mustache.to_html(render("skins/person.html"), {
                        id: id,
                        name: this["name"],
                        age: this["age"],
                        gender: this["gender"]
                    });
                    print(response).html(person);
                });
        },
        post: function(request, response) {
            var par = param(request);

            var form = mustache.to_html(render("skins/form.html"));
            print(response).html(form);

            // filter value can be string or number
            var filter_val = par("filter_val");

            // select... XXX defaults always to = for now
            var filter = {};
            filter[par("filter_by")] = filter_val;


            select("person")
                .find(filter)
                .sort(par("filter_by"))
                .sort(par("sort_by"), par("sort_dir"))
                .each(function(id) {
                    var person = mustache.to_html(render("skins/person.html"), {
                        id: id,
                        name: this["name"],
                        age: this["age"],
                        gender: this["gender"]
                    });
                    print(response).html(person);
                });
        }
    },
    "/person/([a-zA-Z0-9_]+)" : {
        get: function(request, response, q, matches) {
            var id     = parseInt(matches[1], 10);
            select("person")
                .find(id)
                .each(function(id) {
                    var person = mustache.to_html(render("skins/person.html"), {
                        id: id,
                        name: this["name"],
                        age: this["age"],
                        gender: this["gender"]
                    });
                    print(response).html(person);
                });
        }
    },
    "/edit/([0-9]+)" : {
        get: function(request, response, q, matches) {
            var id  = parseInt(matches[1], 10);
            select("person")
                .find()
                .attr({name: "Fuck"});
            response.sendRedirect("/");
        }
    },
    "/delete/([0-9]+)" : {
        get: function(request, response, q, matches) {
            var id  = parseInt(matches[1], 10);
            select("person")
                .find(id)
                .del();
            response.sendRedirect("/");
        }
    }
};


// simple syntax sugar
function print(response) {
    return {
        html: function(str) {
            if(str) {
                response.setContentType('text/html');
                response.getWriter().println(''+str);
            }
        },
        json: function(j) {
            if(j) {
                var jsonString = JSON.stringify(j);
                response.setContentType("application/json");
                response.getWriter().println(jsonString);
            }
        }
    };
}
