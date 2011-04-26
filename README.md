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
        },
        "/recipes/([a-zA-Z0-9_]+)" : {
            get: function(request, response, matches) {
                response.getWriter().println(matches[1]);
            }
        }
    }

Reaching `http://yoursite.com/` will output `Hello World!`, accessing
`http://yoursite.com/foo` will start a new session and going to
`http://yoursite.com/recipes/my-fantastic-recipe` will show you
`my-fantastic-recipe`. 

You can leverage the entire Java API directly through *JavaScript*, avoiding re-compilation times in favor of
raw scripting power!

## Idea behind ApeJS

The idea behind ApeJS is to provide a tiny framework for developing Google App
Engine websites using the JavaScript language. There are other JS
frameworks out there that you could use with App Engine - [RingoJS](http://ringojs.org) and
[AppEngineJS](http://www.appenginejs.org/) are extremely well made -
but I needed something more simple, something that didn't come with tons of
libraries and that could let me prototype applications really quickly (think of
[web.py](http://webpy.org)) and so I created ApeJS.

## How to start

ApeJS works great with Google App Engine. All you have to do is run
`dev_appserver.sh` (or .cmd) against the `war` directory. Next you can start
writing code - the *only* directory you should work with is the `WEB-INF/app/`
directory which basically contains all of your app-code. Ideally if you're
starting a new open-source project that works with ApeJS you would only share
the `app` dir. In there you will find `main.js` which is where the url routing
happens.

Note that in order to use the App Engine Storage API and other App Engine APIs
you have to copy the `appengine-api-1.0-sdk-x.y.z.jar` file from the App
Engine SDK to the `WEB-INF/lib/` directory.

*More to come ...*
