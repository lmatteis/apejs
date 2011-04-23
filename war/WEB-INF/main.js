var apejs = {
    urls: {},
    run: function(request, response) {
        var path = request.getPathInfo();
        var httpMethod = request.getMethod().toLowerCase();
        // look for path TODO more complicated regex matches
        if(this.urls[path]) {
            this.urls[path][httpMethod](request, response);
        }
    }
};

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
