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
you access `http://yoursite.com/image.jpg` the server will look inside
`WEB-INF/app/public/image.jpg` for it.

Note that in order to use the App Engine Storage API and other App Engine APIs
you have to copy the `appengine-api-1.0-sdk-x.y.z.jar` file from the App
Engine SDK to the `WEB-INF/lib/` directory as `appengine-api-1.0-sdk.jar`.

## Importing external JS files

Importing external JS files is quite easy thanks to `require()`. ApeJS is not
compliant with [CommonJS](http://www.commonjs.org/) simply because all the stuff that CommonJS comes
with will not work on Google App Engine where no I/O operations are allowed for
example.

To include ApeJS modules (located under `WEB-INF/modules/`) you can do:

    require("googlestore.js");

Otherwise you can include things from within your app directory by simply adding
a `./` in front of the filename:

    require("./myfile.js");

`require()` will simply evaluate the contents of the JavaScript file in `global`
context. So even if you run it inside a function, it's scope is still global. To
control the scope from which the JavaScript is evaluated, you can pass a second
parameter to the function, which is an object.

    require("./myfile.js", { foo: "bar" });

And inside the `./myfile.js` you can access the `foo` property using the obvious
`this.foo` syntax. So basically `this` becomes the object you pass as a second
parameter to `require()`. If this doesn't make sense please leave a comment or
send me an email.

## Some templating

I thought a lot about templating and instead of re-implementing a language
by-itself I wanted to keep it simple and have the ability to
access files contents as strings and then manipulate them directly with
JavaScript. To do this you can use `render()`:

    var tmpl = render("./index.html")
                .replace("{{title}}", title)
                .replace("{{recipes}}, recipes);

    response.getWriter().println(tmpl);

## Google Datastore

I'm trying to implement a really basic abstraction around the low-level Google
datastore API. You can read the code under `WEB-INF/modules/googlestore.js`.
In order to work with the datastore, first you need to include it in your file.

    require("googlestore.js");

To create an *entity* and store it in the datastore you do:

    var e = googlestore.entity("person", {
        "name": "Luca",
        "age": 25,
        "gender": "female",
        "nationality: "Italian"
    });

    // save the entity to the datastore
    var key = googlestore.put(e);

You get an *entity* from the datastore by using a key:

    // creating a key by ID
    var key = googlestore.createKey("person", 15);

    // get the entity from the datastore
    var person = googlestore.get(key);

Listing more *entities* is done by using a query:

    // selecting youngest 5 adult males as an array
    var people = googlestore.query("person")
        .filter("gender", "=", "male")
        .filter("age", ">=", 18)
        .sort("age", "ASC")
        .fetch(5);

To get properties of an *entity* use the following method:

    person.getProperty("gender");

Finally, there are a couple of **key points** to keep in mind when using the *Datastore API*:

  - Filtering Or Sorting On a Property Requires That the Property Exists
  - Inequality Filters Are Allowed on One Property Only
  - Properties in Inequality Filters Must Be Sorted before Other Sort Orders

http://code.google.com/appengine/docs/java/datastore/queries.html


*More to come ...*
