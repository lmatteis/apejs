var apejs = {
    urls: {},
    run: function(request, response) {
        var path = request.getPathInfo();
        var httpMethod = request.getMethod().toLowerCase();
        // look for path TODO more complicated regex matches
        if(this.urls[path]) {
            this.urls[path][httpMethod](request, response);
        } else {
            response.sendError(response.SC_NOT_FOUND, "This page doesn't exist.");
            
        }
    }
};
