// expects: print, person

var id     = person.getKey().getId();
var name   = person.getProperty("name");
var age    = parseInt(person.getProperty("age"),10);
var gender = person.getProperty("gender");

print("<a href='/person/"+ id +"'>" + name + "</a> "),
print("(" + age + ") - ");
print(gender + " ");
print("(<a href='/delete/"+ id +"'>delete</a>)<br>");