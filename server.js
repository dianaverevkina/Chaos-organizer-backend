import http from "http";
import express from "express";
import WebSocket, { WebSocketServer } from "ws";
import path from "path";
import cors from "cors";
import bodyParser from "body-parser";
import * as crypto from "crypto";
import Store from "./Store.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(
  bodyParser.json({
    type(req) {
      return true;
    },
  })
);
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});

const store = new Store();
store.links = [{
  link: 'https://doka.guide/a11y/screenreaders/',
  date: '23:41'
 }, {
  link: 'https://www.crediblemeds.org/index.php/login/dlcheck',
  date: '22:50',
}];

app.get("/links", async (request, response) => {
  const links = store.links;
  if (links.length === 0) {
    return response
      .send(JSON.stringify(links))
      .end();
  }
  response
    .status(200)
    .send(JSON.stringify({ links }))
    .end();
});

app.get("/media", async (request, response) => {
  const files = store.files;
  console.dir(files)
  if (files.length === 0) {
    return response
      .send(JSON.stringify(files))
      .end();
  }
  response
    .status(200)
    .send(JSON.stringify({ files }))
    .end();
});

const userState = [];

const server = http.createServer(app);
const wsServer = new WebSocketServer({ server });
wsServer.on("connection", (ws) => {
  ws.on("message", (msg, isBinary) => {
    const receivedMSG = JSON.parse(msg);
    console.dir(receivedMSG);
    if (receivedMSG.type === "exit") {
      const idx = userState.findIndex(
        (user) => user.name === receivedMSG.user.name
      );
      userState.splice(idx, 1);
      [...wsServer.clients]
        .filter((o) => o.readyState === WebSocket.OPEN)
        .forEach((o) => o.send(JSON.stringify(userState)));
      return;
    }
    if (receivedMSG.type === "textMessage") {
      const message = {
        id: crypto.randomUUID(),
        text: receivedMSG.message,
        date: store.getTimestamp(),
      };

      const { links, type, user } = receivedMSG;

      store.addLink(links);

      store.messages.push(message);
      const response = {
        message,
        links,
        type,
        user,
      };

      [...wsServer.clients]
        .filter((o) => o.readyState === WebSocket.OPEN)
        .forEach((o) => o.send(JSON.stringify(response), { binary: isBinary }));
    }
    

    if(receivedMSG.type === 'file') {
      const files = [];
      
      for (const file of receivedMSG.files) {
        const fileName = `${Date.now().toString(36)}-${file.name}`;
        const fileDocument = {
          id: crypto.randomUUID(),
          fileName: fileName,
          type: file.type,
          date: store.getTimestamp(),
          path: file.path,
          };
  
          files.push(fileDocument);
          store.files.push(fileDocument);
      }

      const response = {
        message: {id: crypto.randomUUID(), date: store.getTimestamp(),}, 
        files,
        type: receivedMSG.type,
        user: receivedMSG.user,
      };
  
      [...wsServer.clients]
        .filter((o) => o.readyState === WebSocket.OPEN)
        .forEach((o) => o.send(JSON.stringify(response), { binary: isBinary }));
    }
  });
  console.log(userState);
  [...wsServer.clients]
    .filter((o) => o.readyState === WebSocket.OPEN)
    .forEach((o) => o.send(JSON.stringify(userState)));
});


const bootstrap = async () => {
  try {
    server.listen(port, () =>
      console.log(`Server has been started on http://localhost:${port}`)
    );
  } catch (error) {
    console.error(error);
  }
};

bootstrap();