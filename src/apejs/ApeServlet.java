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

public class ApeServlet extends HttpServlet {

    private static final long serialVersionUID = 7313374L;

    private static final ScriptEngineManager mgr = new ScriptEngineManager();
    private static boolean DEBUG;
    private static final Logger LOG = Logger.getLogger(ApeServlet.class.getSimpleName());
    public static String PATH;
    public static String APP_PATH;
    public static ServletConfig CONFIG;

    @Override
    public void init(ServletConfig config) throws ServletException {
        CONFIG = config;
        PATH = config.getServletContext().getRealPath(".");
        PATH += "/WEB-INF"; // we don't want to expose the .js files

        String dbg = config.getInitParameter("debug");
        if ("true".equals(dbg))
                DEBUG = true;
        if (DEBUG)
                LOG.info("Log is enabled");


        APP_PATH = config.getInitParameter("app");
        if (APP_PATH != null && new File(PATH + "/"+ APP_PATH).exists())
            APP_PATH = PATH + "/" + APP_PATH;
        else
            APP_PATH = PATH + "/app";

        if (DEBUG)
                LOG.info("the server side script path is :[" + PATH + "]");
    }

    public void service(ServletRequest request, ServletResponse response)
                    throws ServletException, IOException {
        Context context = Context.enter();
        try {
            HttpServletRequest req = (HttpServletRequest) request;
            HttpServletResponse res = (HttpServletResponse) response;
            res.setContentType("text/html");

            String mainFileName = "main.js";
            File f = new File(APP_PATH + "/" + mainFileName);

            // using this instead of context.initStandardObjects()
            // so importPackage works
            ScriptableObject global = new ImporterTopLevel(context);

            // add the global "names" like require
            String[] names = new String[] {
                "require",
                "render" 
            };
            global.defineFunctionProperties(names, ApeServlet.class, ScriptableObject.DONTENUM);

            // set the ApeServlet context
            Object wrappedOut = context.javaToJS(this, global);
            ScriptableObject.putProperty(global, "ApeServlet", wrappedOut);

            context.evaluateReader(global, new InputStreamReader(new FileInputStream(f), "ISO-8859-1"), mainFileName, 1, null);

            // get the apejs object scope
            ScriptableObject apejsScope = (ScriptableObject)global.get("apejs", global);
            // get the run function from the scope above
            Function fct = (Function)apejsScope.get("run", apejsScope);
            // run the run function 
            Object result = fct.call(context, global, apejsScope, new Object[] {req, res});

        } catch (IOException e) {
            throw new ServletException(e);
        } finally {
            Context.exit();
        }
    };

    public static void require(Context cx, Scriptable thisObj, Object[] args, Function funObj) throws ServletException {
        try {
            // if the args[0] starts with a dot look inside the current APP_PATH
            String filename = (String)args[0];
            File f;
            if(filename.startsWith("./")) {
                filename = filename.replace("./", "");
                f = new File(ApeServlet.APP_PATH + "/" + filename);
            } else {
                // otherwise just look in modules
                f = new File(ApeServlet.PATH + "/modules/" + filename);
            }
            if(args.length == 2) thisObj = (Scriptable)args[1];
            cx.evaluateReader(thisObj, new InputStreamReader(new FileInputStream(f), "ISO-8859-1"), filename, 1, null);
        } catch (IOException e) {
            throw new ServletException(e);
        }
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
        //...checks on aFile are elided
        StringBuilder contents = new StringBuilder();

        try {
            //use buffering, reading one line at a time
            //FileReader always assumes default encoding is OK!
            BufferedReader input =  new BufferedReader(new FileReader(aFile));
            try {
                String line = null; //not declared within while loop
                // readLine is a bit quirky :
                // it returns the content of a line MINUS the newline.
                // it returns null only for the END of the stream.
                // it returns an empty String if two newlines appear in a row.
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
