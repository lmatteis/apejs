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

You can leverage the entire Java API (Rhino) directly through *JavaScript*, avoiding re-compilation times in favor of
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
the `app` dir. 

The main file you need to worry about is `main.js`. This is where all the
handlers for specific urls are called. The examples already in there should get
you started. 

An important folder you want to keep your eyes on is the `/public/` directory.
All your static content should go in here, *stylesheets*, *images* etc. So when
you access `http://yoursite.com/image.jpg` it will look inside
`WEB-INF/app/public/image.jpg` for it.

Note that in order to use the App Engine Storage API and other App Engine APIs
you have to copy the `appengine-api-1.0-sdk-x.y.z.jar` file from the App
Engine SDK to the `WEB-INF/lib/` directory.

### Importing external JS files

Importing external JS files is quite easy thanks to `require()`. ApeJS is not
compliant with [CommonJS](http://www.commonjs.org/) simply because all the stuff that CommonJS comes
with will not work on Google App Engine where no I/O operations are allowed for
example.

To include ApeJS modules (located under `WEB-INF/modules/`) you can do:

    require("googlestore.js");

Otherwise you can include things from within your app directory by simply adding
a `./` in front of the filename:

    require("./myfile.js");

`require()` is also used for templating. In ApeJS templating is done by just
defining JavaScript strings. 

    require("./mytemplate.js")

and the contents of `mytemplate.js` can just output HTML as a multi-line JS
variable:

    // contents of mytemplate.js
    var html = "<html><title>Hello World!</title></html>";

To pass data to the template you `require()` takes an object as its second
argument:

    require("./mytemplate.js", { foo: "bar" });

and in the template...

    // contents of mytemplate.js
    var html = "<html><title>" + foo + "</title></html>";

So to wrap things up here's a complete example:

    // header.js
    var str = "";
    for(var i=0; i<data.length; i++)
        str += data[i] + " - ";

    // main.js
    apejs.urls = {
        "/": {
            get: function(request, response) {
                var data = [1,2,3];
                require("./skins/header.js", { data: data });

                // we can now access the "str" variable which
                // was defined in the "header.js" that we evaluated above
                response.getWriter().println(str);
            }
        }
    }

*More to come ...*
