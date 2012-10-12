# A tiny JavaScript web framework targeted for [Google App Engine](http://code.google.com/appengine)

Prototyping applications is as easy as writing some JSON:

    var apejs = require("apejs.js");
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
            },
            post: function(request, response) {
                // do something during POST request
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

1. Clone ApeJS by simply typing `git clone git@github.com:lmatteis/apejs.git` in a terminal.

2. Download the latest **App Engine Java SDK** from the App Engine website. Unzip,
open the folder and navigate to the `lib/user/` directory where you will find an
`appengine-api-1.0-sdk-x.x.x.jar` file. Copy this *jar* file to the your 
`war/WEB-INF/lib` directory from within the ApeJS dir we cloned in the earlier
step.

3. You're pretty much set. All you have to do is run
`dev_appserver.sh` (or .cmd, found in the App Engine Java SDK) against the `war`
directory of your ApeJS project. 

4. The main file you need to worry about is `main.js`. This is where all the
handlers for specific urls are called. The examples already in there should get
you started. 

5. An important folder you want to keep your eyes on is the `/public/` directory.
All your static content should go in here, *stylesheets*, *images* etc. So when
you access `http://yoursite.com/image.jpg` the server will look inside
`/public/image.jpg` for it.

## Importing external JS files

Importing external JS files is quite easy thanks to `require()`.

To include ApeJS modules (located under `WEB-INF/modules/`) you can do:

    var googlestore = require("googlestore.js");

Otherwise you can include things from within your app directory by simply adding
a `./` in front of the filename:

    var myfile = require("./myfile.js");

`require()` will simply evaluate the contents of the JavaScript file and only expose
whatever you assign `exports` with. This is how CommonJS implements so you could simply
require CommonJS modules and they should work.

## Some templating

*will add some examples using mustache.js*

## Google Datastore

I'm trying to implement a really basic abstraction around the low-level Google
datastore API. You can read the code under `WEB-INF/modules/googlestore.js`.
In order to work with the datastore, first you need to include it in your file.

    var googlestore = require("googlestore.js");

To create an *entity* and store it in the datastore you do:

    var e = googlestore.entity("person", {
        "name": "Luca",
        "age": 25,
        "gender": "female",
        "nationality": "Italian"
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
