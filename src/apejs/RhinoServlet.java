package apejs;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
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
        private String PATH;

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
                Context cx = Context.enter();
                try {
                        HttpServletRequest req = (HttpServletRequest) request;
                        HttpServletResponse res = (HttpServletResponse) response;

                        ScriptEngine jsEngine = mgr.getEngineByName("JavaScript");

                        // load main.js (our main app stuff)
                        File f = new File(PATH + "/main.js");
                        if (f.exists() && f.isFile()) {
                                res.setContentType("text/html");
                                jsEngine.eval(new FileReader(f)); // evaluating our main.js file

                                // get the apejs object
                                Object apejs = jsEngine.get("apejs");

                                Invocable inv = (Invocable)jsEngine;
                                // we call the run function inside the apejs object
                                inv.invokeMethod(apejs, "run", req, res);
                        } else {
                                res.setStatus(404);
                        }
                } catch (ScriptException e) {
                        throw new ServletException(e);
                } catch (NoSuchMethodException e) {
                        throw new ServletException(e);
                }
        };

}
