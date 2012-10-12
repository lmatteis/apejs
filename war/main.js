var apejs = require("apejs.js");
var console = require("console.js");
var select = require("select.js");
var version = require("version.js");

var mustache = require("./common/mustache.js");

apejs.urls = {
    "/": {
        get: function(request, response) {
            var p = param(request);

            var html = mustache.to_html(render("skins/index.html"), {
                package: version.package,
                version: version.number
            });
            print(response).text(html);

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
                    print(response).text(person);
                });
        },
        post: function(request, response) {
            var p = param(request);
            select('person')
                .add({
                    "name"  : p("name"),
                    "gender": p("gender"),
                    "age":    parseInt(p("age"), 10),
                    "jobs":   ["fanner", "fut", "fab"],
                    "json":   {"foo":"bar"}
                });
            response.sendRedirect("/");
        }
    },
    "/test" : {
        get: function(request, response) {
            var form = mustache.to_html(render("skins/form.html"));
            print(response).text(form);

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
                    print(response).text(person);
                });
        },
        post: function(request, response) {
            var par = param(request);

            var form = mustache.to_html(render("skins/form.html"));
            print(response).text(form);

            var filter_by = par("filter_by");
            // filter value can be string or number
            var filter_val = par("filter_val");

            // note the hacky type conversions: par(...) does not yield a
            // string directly, and numeric filters must have a number.
            filter_by = '' + filter_by;
            filter_val = '' + filter_val;
            if (filter_by==='age') {
                filter_val = +filter_val;
            }
            // create select options
            var filter = {};
            filter[filter_by + par("filter_op")] = filter_val;


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
                    print(response).text(person);
                });
        }
    },
    "/person/([a-zA-Z0-9_]+)" : {
        get: function(request, response, matches) {
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
                    print(response).text(person);
                });
        }
    },
    "/edit/([0-9]+)" : {
        get: function(request, response, matches) {
            var id  = parseInt(matches[1], 10);
            select("person")
                .find(id)
                .attr({name: "Name Has Been Edited"});
            response.sendRedirect("/");
        }
    },
    "/delete/([0-9]+)" : {
        get: function(request, response, matches) {
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
        text: function(text) {
            if(text) response.getWriter().println(text);
        }
    };
}
function param(request) {
    return function(par) {
        var p = request.getParameter(par);
        if(p) return p;
        else return false;
    }
}
