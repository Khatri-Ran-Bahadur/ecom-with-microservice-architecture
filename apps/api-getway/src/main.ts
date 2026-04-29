/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';

import cors from "cors";
import proxy from "express-http-proxy";
import morgan from "morgan";
import ratelimit from "express-rate-limit";
import { ipKeyGenerator } from "express-rate-limit";
// import swaggerui from "swagger-ui-express"
// import axios from "axios";
import cookieParser from "cookie-parser";
import initializeSiteConfig from "./libs/initalizeSiteConfig";


const app = express();
app.use(cors({
  origin: ["http://localhost:3000"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(morgan("dev"));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(cookieParser());

app.set("trust proxy", 1);

const limiter = ratelimit({
  windowMs: 15 * 60 * 1000,
  max: (req: any) => (req.user ? 1000 : 100),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
  keyGenerator: ipKeyGenerator,
});
app.use(limiter);

app.get('/getway-health', (req, res) => {
  res.send({ message: 'Welcome to api-getway!' });
});

app.use('/products', proxy("http://localhost:6002"));
app.use('/', proxy("http://localhost:6001"));

// Default to 8081 to avoid clashing with other local services.
const port = process.env.PORT || 8082;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
  try {
    initializeSiteConfig();
    console.log("Site config initialized successfully");
  } catch (error) {
    console.error("Error initializing site config", error);
  }
});
server.on('error', console.error);
