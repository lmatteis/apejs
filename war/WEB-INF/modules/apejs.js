importPackage(java.io);

var apejs = {
    urls: {},
    getQueryParameters: function(req) {
        var ret = {};
        var parameterNames = req.getParameterNames();
        while (parameterNames.hasMoreElements()) {
            var paramName = parameterNames.nextElement();
            var paramValues = req.getParameterValues(paramName);
            if(paramValues.length == 1) {
                ret[paramName] = ''+paramValues[0];
            } else if(paramValues.length > 1) {
                ret[paramName] = [];
                for(var i = 0; i< paramValues.length; i++) {
                    ret[paramName].push(''+paramValues[i]);
                }
            }
        }
        return ret;
    },
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
                // turn the query into a JS object
                var query = apejs.getQueryParameters(request);
                this.urls[i][httpMethod](request, response, query, matches);
                matchedUrl = true;
                break; // we found it, stop searching
            }
        }

        if(!matchedUrl)
            return response.sendError(response.SC_NOT_FOUND);
    }
};
exports = apejs;
