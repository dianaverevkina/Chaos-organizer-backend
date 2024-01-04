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
const limit = 10;
store.links = [{
  link: 'https://doka.guide/a11y/screenreaders/',
  date: '23:41'
 }, {
  link: 'https://www.crediblemeds.org/index.php/login/dlcheck',
  date: '22:50',
}];
store.messages = [
  {
    id: '1',
    text: 'hello',
    date: '1',
  },
  {
    id: '2',
    text: 'hi',
    date: '1',
  },
  {
    id: '3',
    text: 'how',
    date: '1',
  },
  {
    id: '4',
    text: 'are',
    date: '1',
  },
  {
    id: '5',
    text: 'you',
    date: '1',
  },
  {
    id: '6',
    text: 'im ok',
    date: '1',
  },
  {
    id: '7',
    text: 'wonderful',
    date: '1',
  },
  {
    id: '8',
    text: 'nice',
    date: '1',
  },
  {
    id: '9',
    text: 'cat',
    date: '1',
  },
  {
    id: '10',
    text: 'mouse',
    date: '1',
  },
  {
    id: '11',
    text: 'beauty',
    date: '1',
  },
  {
    id: '12',
    text: 'shower',
    date: '1',
  },
  {
    id: '13',
    text: 'cool',
    date: '1',
  },
  {
    id: '14',
    text: 'magic',
    date: '1',
  },
  {
    id: '15',
    text: 'love',
    date: '1',
  },
  {
    id: '16',
    text: 'hate',
    date: '1',
  },
  {
    id: '17',
    text: 'kind',
    date: '1',
  },
  {
    id: '18',
    text: 'haha',
    date: '1',
  },
  {
    id: '19',
    text: 'hare',
    date: '1',
  },
  {
    id: '20',
    text: 'khight',
    date: '1',
  },
  {
    id: '21',
    text: 'animal',
    date: '1',
  },
];

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
  const media = store.files.filter(file => !file.type.includes('audio'));
  console.dir(media)
  if (media.length === 0) {
    return response
      .send(JSON.stringify(media))
      .end();
  }
  response
    .status(200)
    .send(JSON.stringify({ media }))
    .end();
});

app.get("/files", async (request, response) => {
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


    if (receivedMSG.type === "load") {
      const messages = store.getTenMessages(limit, receivedMSG.index);
      if (!messages) return;
      const response = {
        messages: messages, 
        type: receivedMSG.type,
        user: receivedMSG.user,
      };
      [...wsServer.clients]
        .filter((o) => o.readyState === WebSocket.OPEN)
        .forEach((o) => o.send(JSON.stringify(response), { binary: isBinary }));
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
      console.dir(store.messages);
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
          fullDate: store.getFulldate(),
          path: file.path,
          size: store.formatFileSize(file.size),
        };
  
          files.push(fileDocument);
          store.files.push(fileDocument);
      }

      const response = {
        message: {id: crypto.randomUUID(), text: receivedMSG.message, date: store.getTimestamp(),}, 
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