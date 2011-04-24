# A tiny JavaScript web framework targeted for Google App Engine

Prototyping applications is as easy as writing some JSON:

    require("apejs.js");
    apejs.urls = {
        "/": {
            get: function(request, response) {
                response.getWriter().println("Hello World!");
            }
        },
        "/foo": {
            get: function(request, response) {
                request.getSession(true);
            }
        }
    }

Reaching `http://yoursite.com/` will output `Hello World!`, and accessing
`http://yoursite.com/foo` will start a new session. 

You can leverage the entire Java API directly through *JavaScript*, avoiding re-compilation times in favor of
raw scripting power!

*More to come ...*
