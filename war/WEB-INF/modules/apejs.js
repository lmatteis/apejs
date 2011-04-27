importPackage(java.io);

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
            try {
                // FIXME - this is really ugly - find other way to get servlet Context
                var mimeType = ApeServlet.CONFIG.getServletContext().getMimeType(path);
                var resPath = ApeServlet.APP_PATH+"/public"+path;
                var res = new File(resPath);
                // create an array of bytes as big as the file
                var b = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, res.length()); 
                var fileInputStream = new FileInputStream(res);
                // read file contents into byte array
                fileInputStream.read(b);

                response.setContentType(mimeType);
                response.getOutputStream().write(b);
            } catch (e) {
                response.getWriter().println(e);
            }
        }
    }
};
