importPackage(java.io);

var apejs = {
    urls: {},
    run: function(request, response) {
        var path = request.getPathInfo();
        var httpMethod = request.getMethod().toLowerCase();

        // before running the http verb method run the before handler
        if(this.before)
            this.before(request, response);

        var matchedUrl = false;
        for(var i in this.urls) {
            var regex = "^"+i+"/?$";
            var matches = path.match(new RegExp(regex));
            if(matches && matches.length) { // matched!
                this.urls[i][httpMethod](request, response, matches);
                matchedUrl = true;
                break; // we found it, stop searching
            }
        }

        if(!matchedUrl)
            return response.sendError(response.SC_NOT_FOUND);
    }
};
