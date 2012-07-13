package apejs;

import java.io.*;
import java.util.logging.Logger;
import java.util.*;

import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.mozilla.javascript.*;

import com.google.appengine.api.utils.*;

public class ApeServlet extends HttpServlet {
    public static String APP_PATH;

    private ScriptableObject global;

    public void init(ServletConfig config) throws ServletException {
        super.init(config);
        APP_PATH = config.getServletContext().getRealPath(".");
        Context context = Context.enter();
        try {
            global = initGlobalContext(context);
        } catch (IOException e) {
            throw new ServletException(e);
        } finally {
            Context.exit();
        }
    }

    public void service(ServletRequest request, ServletResponse response)
                    throws ServletException, IOException {
        Context context = Context.enter();
        try {
            HttpServletRequest req = (HttpServletRequest) request;
            HttpServletResponse res = (HttpServletResponse) response;
            res.setContentType("text/html");

            ScriptableObject global = this.global;
            
            // if we're in development mode, recompile the JavaScript everytime
            if(SystemProperty.environment.value() == SystemProperty.Environment.Value.Development) {
                global = initGlobalContext(context); 
            }

            // get the "run" function from the apejs scope and run it
            ScriptableObject apejsScope = (ScriptableObject)global.get("apejs", global);
            Function fct = (Function)apejsScope.get("run", apejsScope);
            Object result = fct.call(context, global, apejsScope, new Object[] {req, res});
        } finally {
            Context.exit();
        }
    }

    /**
     * Evaluates main.js, starts the global scope and defines somes global JS functions
     */
    private ScriptableObject initGlobalContext(Context context) throws IOException, ServletException { 
        String mainFileName = "main.js";
        File mainFile = new File(APP_PATH + "/" + mainFileName);

        // overwrite the global so each requests knows which context we're in
        ScriptableObject global = new ImporterTopLevel(context);

        // add the global "names" like require
        String[] names = new String[] {
            "require",
            "render" 
        };
        global.defineFunctionProperties(names, ApeServlet.class, ScriptableObject.DONTENUM);
        
        // compile main.js
        Script script = context.compileString(getContents(mainFile), mainFileName, 1, null);
        script.exec(context, global);
        //context.evaluateReader(global, new InputStreamReader(new FileInputStream(mainFile), "ISO-8859-1"), mainFileName, 1, null);
        return global;
    }

    public static ScriptableObject require(Context cx, Scriptable thisObj, Object[] args, Function funObj) throws ServletException {
        Scriptable obj; 
        try {
            // if the args[0] starts with a dot look inside the current APP_PATH
            String filename = (String)args[0];
            File f;
            if(filename.startsWith("./")) {
                filename = filename.replace("./", "");
                f = new File(ApeServlet.APP_PATH + "/" + filename);
            } else {
                // otherwise just look in modules
                f = new File(ApeServlet.APP_PATH + "/WEB-INF/modules/" + filename);
            }
            // create a new "exports" scope and pass it in
            obj = cx.newObject(thisObj);
            obj.setParentScope(thisObj); // not sure what this does (i think it's for importPackage to work)
            ScriptableObject.putProperty(obj, "exports", cx.newObject(obj));
            
            Script script = cx.compileString(getContents(f), filename, 1, null);
            script.exec(cx, obj);
            //cx.evaluateReader(obj, new InputStreamReader(new FileInputStream(f), "ISO-8859-1"), filename, 1, null);

        } catch (IOException e) {
            throw new ServletException(e);
        }
        // now that we evaluated the file, get the "exports" variable and return it
        return (ScriptableObject)ScriptableObject.getProperty(obj, "exports");
    }

    public static String render(Context cx, Scriptable thisObj, Object[] args, Function funObj) throws ServletException {
        String fileContents = "";
        try {
            String filename = (String)args[0];
            if(filename.startsWith("./")) 
                filename = filename.replace("./", "");

            if(filename.startsWith("/")) 
                filename = filename.replace("/", "");

            // only look in app folder
            File f = new File(ApeServlet.APP_PATH + "/" + filename);

            // convert the file to simple string
            fileContents = getContents(f);
        } catch (IOException e) {
            throw new ServletException(e);
        }

        return fileContents;
    }

    static public String getContents(File aFile) throws IOException, ServletException {
        StringBuilder contents = new StringBuilder();
        try {
            BufferedReader input =  new BufferedReader(
              new InputStreamReader(new FileInputStream(aFile), "UTF8")
            );
            try {
                String line = null;
                while (( line = input.readLine()) != null){
                    contents.append(line);
                    contents.append(System.getProperty("line.separator"));
                }
            } finally {
                input.close();
            }
        } catch (IOException e){
            throw new ServletException(e);
        }
        return contents.toString();
    }
}
