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
    message: {
      id: '1',
      text: 'It’s a special day at the ABC Zoo. A new animal is here',
      date: '1',
    },
    links: [],
    type: 'textMessage',
    user: {name: 'user'},
  },
  {
    message: {
      id: '2',
      text: 'It’s a zorilla from Africa. She needs a home',
      date: '1',
    },
    links: [],
    type: 'textMessage',
    user: {name: 'user'},
  },
  {
    message: {
      id: '3',
      text: "Let’s see. An aardvark, a boa constrictor, a coyote and a duck-billed platypus. The zorilla doesn’t go here.",
      date: '1',
    },
    links: [],
    type: 'textMessage',
    user: {name: 'user'},
  },
  {
    message: {
      id: '4',
      text: 'An emu, a flamingo, a giraffe and a hyena. The zorilla doesn’t go here',
      date: '1',
    },
    links: [],
    type: 'textMessage',
    user: {name: 'user'},
  },
  {
    message: {
      id: '5',
      text: 'Elizabeth was very clever, but she had a difficult childhood with her bad-tempered father and so many stepmothers.',
      date: '1',
    },
    links: [],
    type: 'textMessage',
    user: {name: 'user'},
  },
  {
    message: {
      id: '6',
      text: 'Elizabeth became queen in 1558',
      date: '1',
    },
    links: [],
    type: 'textMessage',
    user: {name: 'user'},
  },
  {
    message: {
      id: '7',
      text: ' You are the new queen.',
      date: '1',
    },
    links: [],
    type: 'textMessage',
    user: {name: 'user'},
  },
  {
    message: {
      id: '8',
      text: 'Elizabeth sent explorers sailing around the world',
      date: '1',
    },
    links: [],
    type: 'textMessage',
    user: {name: 'user'},
  },
  {
    message: {
      id: '9',
      text: 'In 1588, the Spanish king sent a huge fleet of ships to attack England.',
      date: '1',
    },
    links: [],
    type: 'textMessage',
    user: {name: 'user'},
  },
  {
    message: {
      id: '10',
      text: 'I know I have the body of a weak woman, but I have the heart and stomach of a king.',
      date: '1',
    },
    links: [],
    type: 'textMessage',
    user: {name: 'user'},
  },
  {
    message: {
      id: '11',
      text: 'Elizabeth’s cousin, Mary, was Queen of Scotland.',
      date: '1',
    },
    links: [],
    type: 'textMessage',
    user: {name: 'user'},
  },
  {
    message: {
      id: '12',
      text: 'd. Mary had to run away from Scotland and she asked Elizabeth to protect her',
      date: '1',
    },
    links: [],
    type: 'textMessage',
    user: {name: 'user'},
  },
  {
    message: {
      id: '13',
      text: 'Elizabeth was afraid that Mary wanted to become Queen of England',
      date: '1',
    },
    links: [],
    type: 'textMessage',
    user: {name: 'user'},
  },
  {
    message: {
      id: '14',
      text: 'Elizabeth was queen for 45 years.',
      date: '1',
    },
    links: [],
    type: 'textMessage',
    user: {name: 'user'},
  },
  {
    message: {
      id: '15', 
      text: 'Wonderful nature', 
      date: '12:15',
    }, 
    files: [
      {
        id: '111',
        fileName: 'nature',
        type: 'image',
        date: '12:00',
        fullDate: '12.01 12:00',
        path: 'https://i0.wp.com/picjumbo.com/wp-content/uploads/beautiful-nature-mountain-scenery-with-flowers-free-photo.jpg?w=600&quality=80',
        size: '5Mb',
      },
    ],
    type: 'file',
    user: {name: 'user'},
  },
  {
    message: {
      id: '16', 
      text: '', 
      date: '12:15',
    }, 
    files: [
      {
        id: '116',
        fileName: 'nature',
        type: 'image',
        date: '12:00',
        fullDate: '12.01 12:00',
        path: 'https://hips.hearstapps.com/hmg-prod/images/nature-quotes-landscape-1648265299.jpg',
        size: '5Mb',
      },
    ],
    type: 'file',
    user: {name: 'user'},
  }
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
        savedMessages: messages, 
        type: receivedMSG.type,
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

      const response = {
        message,
        links,
        type,
        user,
      };
      store.messages.push(response);
      console.dir(store.messages);
      [...wsServer.clients]
        .filter((o) => o.readyState === WebSocket.OPEN)
        .forEach((o) => o.send(JSON.stringify(response), { binary: isBinary }));
    }
    

    if(receivedMSG.type === 'file') {
      const files = [];
      
      for (const file of receivedMSG.files) {
        // const fileName = `${Date.now().toString(36)}-${file.name}`;
        const fileDocument = {
          id: crypto.randomUUID(),
          fileName: file.name,
          type: file.type,
          date: store.getTimestamp(),
          fullDate: store.getFulldate(),
          path: file.path,
          size: store.formatFileSize(file.size),
          duration: file.duration,
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

      store.messages.push(response);
  
      [...wsServer.clients]
        .filter((o) => o.readyState === WebSocket.OPEN)
        .forEach((o) => o.send(JSON.stringify(response), { binary: isBinary }));
    }
  });

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