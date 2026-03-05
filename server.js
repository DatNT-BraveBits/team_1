import { createRequestHandler } from "@react-router/express";
import compression from "compression";
import express from "express";
import morgan from "morgan";
import { handleUpgrade } from "./app/features/feature-5/utils/websocket.server.js";

const port = Number(process.env.PORT || 3000);
const buildPath = "./build/server/index.js";

const app = express();
app.disable("x-powered-by");
app.use(compression());

app.use(
  "/assets",
  express.static("build/client/assets", { immutable: true, maxAge: "1y" }),
);
app.use(express.static("build/client", { maxAge: "1h" }));
app.use(express.static("public", { maxAge: "1h" }));
app.use(morgan("tiny"));

const build = await import(buildPath);
app.all("*", createRequestHandler({ build, mode: process.env.NODE_ENV }));

const server = app.listen(port, () => {
  console.log(`[server] http://localhost:${port}`);
});

// WebSocket upgrade handling
server.on("upgrade", (request, socket, head) => {
  handleUpgrade(request, socket, head);
});
