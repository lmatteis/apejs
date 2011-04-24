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

## Idea behind ApeJS

The idea behind ApeJS is to provide a tiny framework for developing Google App
Engine websites using the JavaScript language. There are other JS
frameworks out there that you could use with App Engine - [RingoJS](http://ringojs.org) and
[AppEngineJS](http://www.appenginejs.org/) are extremely well made -
but I needed something more simple, something that didn't come with tons of
libraries and that could let me prototype applications really quickly (think of
[web.py](http://webpy.org)) and so I created ApeJS.

## How to start

ApeJS works great with Google App Engine. Open the `build.xml` file and change
the path to your app-engine sdk path. 

Then type `ant compile` to compile the entire project.

Now you basically have a `war` project ready to be deployed to the Google App
Engine cloud. To test things out use the `dev_appserver.sh` (or .cmd) script by
simply running it against the project `war` directory.

*More to come ...*
