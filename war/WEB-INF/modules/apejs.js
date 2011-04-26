var apejs = {
    urls: {},
    run: function(request, response) {
        var path = request.getPathInfo();
        var httpMethod = request.getMethod().toLowerCase();
        // "/recipes/fafa/add".match(new RegExp("/recipes/([a-zA-Z0-9_]+)/"))
        var matchedSomething = false;
        for(var i in this.urls) {
            var regex = "^"+i+"/?$";
            var matches = path.match(new RegExp(regex));
            if(matches && matches.length) { // matched!
                this.urls[i][httpMethod](request, response, matches);
                matchedSomething = true;
            }
        }

        if(!matchedSomething) {
            response.sendError(response.SC_NOT_FOUND, "This page doesn't exist.");
        }
    }
};
