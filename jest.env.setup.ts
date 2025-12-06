import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.test for testing
dotenv.config({ 
  path: path.resolve(process.cwd(), ".env.test"),
  quiet: true
});
