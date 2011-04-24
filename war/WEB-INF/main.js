require("apejs.js");

var index = {
    get: function(request, response) {
        require("index.js", {
            "apple": "sweet" 
        });
        response.getWriter().println(skin);
    }
};

var test = {
    get: function(request, response) {
        response.getWriter().println("Recipe");
    }
};

apejs.urls = {
    "/": index,
    "/recipe/food" : test
};
