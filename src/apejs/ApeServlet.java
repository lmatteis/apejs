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

        @Override
        public void init(ServletConfig config) throws ServletException {
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

                    File f = new File(APP_PATH + "/main.js");

                    // using this instead of context.initStandardObjects()
                    // so importPackage works
                    ScriptableObject global = new ImporterTopLevel(context);

                    // add the global "names" like require
                    String[] names = new String[] {
                        "require"
                    };
                    global.defineFunctionProperties(names, ApeServlet.class, ScriptableObject.DONTENUM);

                    Object wrappedOut = context.javaToJS(this, global);
                    ScriptableObject.putProperty(global, "ApeServlet", wrappedOut);
                    

                    context.evaluateReader(global, new FileReader(f), "script", 1, null);

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

        //public static void require(String jsFilePath) throws ServletException {
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
                cx.evaluateReader(thisObj, new FileReader(f), "script", 1, null);
            } catch (IOException e) {
                throw new ServletException(e);
            }
        }
}
