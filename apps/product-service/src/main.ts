import './env';
import express from 'express';
import cors from "cors";
import { errorMiddleware } from '@packages/error-handler/error-middleware';
import cookieParser from 'cookie-parser';
import router from "./routes/product.router";
import swaggerUi from "swagger-ui-express";
// @ts-ignore
import swaggerDocument from "./swagger-output.json";
import "./jobs/product-crone.job";


const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 6002;

const app = express();
app.use(cors({
  origin: ["http://localhost:3000"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/docs-json', (req, res) => {
  res.json(swaggerDocument);
});

app.use("/api", router);

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to product-service!' });
});


app.use(errorMiddleware);

const server = app.listen(port, () => {
  console.log(`[ Product Serviceready ] http://${host}:${port}/api`);
  console.log(`[ docs ] http://${host}:${port}/api-docs`);
});

server.on("error", (err) => {
  console.log("Server Error:" + err);
});
