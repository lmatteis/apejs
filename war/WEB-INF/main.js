require("apejs.js");

var index = {
    get: function(request, response) {
        response.getWriter().println("<b>Fuck nice!!</b>");
    }
};

var test = {
    get: function(request, response) {
        response.getWriter().println("Recipe");
    }
};

apejs.urls = {
    "/": index,
    "/recipe/food" : test
};
