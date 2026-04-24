import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the root .env file
// Using process.cwd() is more reliable in bundled environments like Nx/Webpack
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log("Environment variables loaded from root .env");
console.log("SMTP_USER present:", !!process.env.SMTP_USER);
console.log("SMTP_PASS present:", !!process.env.SMTP_PASS);
