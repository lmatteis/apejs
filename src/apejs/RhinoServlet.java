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


/**
 * Servlet implementation class RhinoServlet
 */
public class RhinoServlet extends HttpServlet {

        private static final long serialVersionUID = 7313374L;

        private static final ScriptEngineManager mgr = new ScriptEngineManager();
        private static boolean DEBUG;
        private static final Logger LOG = Logger.getLogger(RhinoServlet.class.getSimpleName());
        public static String PATH;
        public static ScriptableObject global;
        public static Context context;

        @Override
        public void init(ServletConfig config) throws ServletException {
                PATH = config.getServletContext().getRealPath(".");

                String dbg = config.getInitParameter("debug");
                if ("true".equals(dbg))
                        DEBUG = true;
                if (DEBUG)
                        LOG.info("Log is enabled");

                String ssPath = config.getInitParameter("serversidepath");
                if (ssPath != null && new File(PATH + ssPath).exists())
                        PATH += ssPath;
                else
                        PATH += "/WEB-INF"; // we don't want to expose the .js files
                if (DEBUG)
                        LOG.info("the server side script path is :[" + PATH + "]");
        }

        public void service(ServletRequest request, ServletResponse response)
                        throws ServletException, IOException {
                context = Context.enter();
                try {
                    HttpServletRequest req = (HttpServletRequest) request;
                    HttpServletResponse res = (HttpServletResponse) response;
                    res.setContentType("text/html");

                    File f = new File(PATH + "/main.js");

                    global = context.initStandardObjects();

                    // add the global "names" like require
                    String[] names = new String[] {
                        "require"
                    };
                    global.defineFunctionProperties(names, RhinoServlet.class, ScriptableObject.DONTENUM);

                    context.evaluateReader(global, new FileReader(f), "script", 1, null);

                    // get the apejs object scope
                    ScriptableObject apejsScope = (ScriptableObject)global.get("apejs", global);
                    // get the run function from the scope above
                    Function fct = (Function)apejsScope.get("run", apejsScope);
                    // run the run function 
                    Object result = fct.call(
                            context, global, apejsScope, new Object[] {req, res});

                } catch (IOException e) {
                    throw new ServletException(e);
                } finally {
                    Context.exit();
                }
        };

        //public static void require(String jsFilePath) throws ServletException {
        public static void require(Context cx, Scriptable thisObj, Object[] args, Function funObj) throws ServletException {
            try {
                File f = new File(RhinoServlet.PATH + "/" + args[0]);
                if(args.length == 2) thisObj = (Scriptable)args[1];
                cx.evaluateReader(thisObj, new FileReader(f), "script", 1, null);
            } catch (IOException e) {
                throw new ServletException(e);
            }
        }
}
