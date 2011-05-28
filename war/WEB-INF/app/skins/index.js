require("./skins/header.js", { "print": print });

print("<h1>Add person</h1>");
print("<form method='post'>");
print("Name: <input type='text' name='name'/><br>");
print("Age: <input type='text' name='age' /><br>");
print("Gender: <select name='gender'><option>male</option><option>female</option></select><br>");
print("<input type='submit' />");
print("</form><br>");

var allPeople = googlestore.query("Person").fetch();
allPeople.forEach(function(person){
    require("./skins/person.js", {
            "print" : print,
            "person": person
    });
});