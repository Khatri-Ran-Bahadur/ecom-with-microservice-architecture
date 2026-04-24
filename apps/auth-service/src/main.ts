import './env';
import express from 'express';
import cors from "cors";
import { errorMiddleware } from '@packages/error-handler/error-middleware';
import cookieParser from 'cookie-parser';
import router from "./routes/auth.router";
import swaggerUi from "swagger-ui-express";
// @ts-ignore
import swaggerDocument from "./swagger-output.json";


const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 6001;

const app = express();
app.use(cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send({ 'message': 'Hello API' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/docs-json', (req, res) => {
    res.json(swaggerDocument);
});

app.use("/api", router);

app.use(errorMiddleware);

const server = app.listen(port, () => {
    console.log(`[ ready ] http://${host}:${port}/api`);
    console.log(`[ docs ] http://${host}:${port}/api-docs`);
});

server.on("error", (err) => {
    console.log("Server Error:" + err);
});
