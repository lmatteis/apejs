require("./skins/header.js");
for(var i=0; i<allPeople.length; i++) {
    skin += allPeople[i].getProperty("gender") + " - " + allPeople[i].getProperty("age") + "<br>";
}
skin += "<form method='post'>Person Name:<input type='text' name='name'/><br>Person gender:<input type='text' name='gender' /><br>Person age:<input type='text' name='age' />";
skin += "<br><input type='submit' /></form>";
