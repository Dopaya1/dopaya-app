import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupDatabase, createDatabaseHelperFunctions } from "./setup-db";
import { createDatabaseSchema } from "./direct-schema-setup";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    // Validate JSON before sending
    try {
      // Handle undefined and null values
      if (bodyJson === undefined) {
        console.warn('Warning: undefined response body, converting to null');
        bodyJson = null;
      }
      
      // Test JSON serialization
      const testJson = JSON.stringify(bodyJson);
      capturedJsonResponse = bodyJson;
    } catch (error) {
      console.error('JSON serialization error:', error);
      capturedJsonResponse = { error: 'Response serialization failed' };
      return originalResJson.apply(res, [{ error: 'Internal server error' }, ...args]);
    }
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse !== undefined) {
        try {
          // Handle null and undefined values safely
          if (capturedJsonResponse === null) {
            logLine += ` :: null`;
          } else {
            // Safely stringify and truncate large responses
            const jsonStr = JSON.stringify(capturedJsonResponse);
            if (jsonStr.length > 200) {
              logLine += ` :: ${jsonStr.slice(0, 50)}...`;
            } else {
              logLine += ` :: ${jsonStr}`;
            }
          }
        } catch (error) {
          logLine += ` :: [Response serialization error]`;
        }
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Make sure fix-db-connection has a chance to run
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Try to set up the database automatically
  try {
    console.log('Attempting to initialize database on startup...');
    
    // First create the helper functions
    console.log('Creating database helper functions...');
    const helperResult = await createDatabaseHelperFunctions();
    
    if (helperResult.success) {
      console.log('Successfully created database helper functions');
    } else {
      console.warn('Helper function creation warning:', helperResult.message);
    }
    
    // First try the traditional setup approach
    console.log('Setting up database schema using traditional approach...');
    const result = await setupDatabase();
    
    if (result.success) {
      console.log('Successfully initialized database schema using traditional approach');
    } else {
      console.warn('Traditional database initialization warning:', result.message);
      
      // If that fails, try the direct schema setup approach
      console.log('Attempting alternative direct schema creation approach...');
      const directResult = await createDatabaseSchema();
      
      if (directResult.success) {
        console.log('Successfully created database schema using direct approach');
      } else {
        console.warn('Direct schema creation warning:', directResult.message);
        console.warn('Database will need to be set up manually via /api/system/setup-db');
        
        // Check the connection status to diagnose further
        try {
          const { testDatabaseConnection } = await import('./db-test');
          const connResult = await testDatabaseConnection();
          
          if (connResult.success) {
            console.log('Database connection is working, but schema initialization failed.');
          } else {
            console.warn('Database connection is NOT working. Please check your DATABASE_URL environment variable.');
          }
        } catch (connErr) {
          console.error('Error checking database connection:', connErr);
        }
      }
    }
  } catch (error) {
    console.error('Failed to initialize database on startup:', error);
    console.warn('Database will need to be set up manually via /api/system/setup-db');
  }
  
  const server = await registerRoutes(app);

  // Add social media bot handler BEFORE Vite (so bots get proper OG tags)
  const { socialMetaMiddleware } = await import('./social-meta-middleware');
  app.use(socialMetaMiddleware);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    // Handle JSON parsing errors specifically
    if (err.type === 'entity.parse.failed' || err.message?.includes('JSON')) {
      console.error('JSON parsing error in request:', err);
      return res.status(400).json({ 
        error: 'Invalid JSON in request body',
        message: 'Request body must be valid JSON' 
      });
    }

    res.status(status).json({ message });
    throw err;
  });

  // Add global error handlers
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = process.env.PORT || 3001;
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
