var apejs = {
    urls: {},
    run: function(request, response) {
        var path = request.getPathInfo();
        var httpMethod = request.getMethod().toLowerCase();
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

        if(!matchedUrl) { // try accessing static content inside APP_PATH/public
            response.getWriter().println(ApeServlet.APP_PATH);
            //request.getRequestDispatcher("WEB-INF/app/public"+path).forward(request, response);
            //response.sendError(response.SC_NOT_FOUND, "This page doesn't exist.");
        }
    }
};
