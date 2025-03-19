import express from "express";
import { type Request, type Response } from "express";
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import bodyParser from "body-parser";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import db from "./services/db";

// declare global {
//   namespace Express {
//     interface User {
//       id: number;
//       username: string;
//     }
//   }
// }

const port = process.env.PORT || 3000;
const jwtSecret = "Mys3cr3t";

const app = express();
const httpServer = createServer(app);

app.use(bodyParser.json());

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

// app.get(
//   "/self",
//   passport.authenticate("jwt", { session: false }),
//   (req, res) => {
//     if (req.user) {
//       res.send(req.user);
//     } else {
//       res.status(401).end();
//     }
//   },
// );

app.post("/login", (req, res) => {
  if (req.body.username === "john" && req.body.password === "changeit") {
    console.log("authentication OK");

    const user = {
      id: 1,
      username: "john",
    };

    const token = jwt.sign(
      {
        data: user,
      },
      jwtSecret,
      {
        // issuer: "accounts.examplesoft.com",
        // audience: "yoursite.net",
        expiresIn: "1h",
      },
    );

    res.json({ token });
  } else {
    console.log("wrong credentials");
    res.status(401).end();
  }
});

// const jwtDecodeOptions = {
//   jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//   secretOrKey: jwtSecret,
//   // issuer: "accounts.examplesoft.com",
//   // audience: "yoursite.net",
// };

// passport.use(
//   new JwtStrategy(jwtDecodeOptions, (payload, done) => {
//     return done(null, payload.data);
//   }),
// );

const io = new Server(httpServer,{
  cors:{
    origin:"*"
  }
});

// io.engine.use(
//   (req: { _query: Record<string, string> }, res: Response, next: Function) => {
//     const isHandshake = req._query.sid === undefined;
//     if (isHandshake) {
//       passport.authenticate("jwt", { session: false })(req, res, next);
//     } else {
//       next();
//     }
//   },
// );

io.use((socket,next)=>{

  if(socket.handshake.auth.token) {
    
  }

  console.log(socket.handshake.auth.token);
  next();

});

io.on("connection", (socket) => {

  console.log(`connect: socket ${socket.id}`);

  socket.onAny(async (event,...args)=>{

    if(args.length<1) return;
    
    const payload = args[0];
    if(payload.token) {
      // await db.query("SEL")
    }

    if(payload.room) {
      socket.join(payload.room)
    }

    // check token and set userdata if valid

    // update userStore

    console.log(args);

    // check room and leave all other rooms if room changes

    // get filename by event and pass it the io, the socket and the args

  });

  const req = socket.request as Request & { user: Express.User };

  // socket.join(`user:${req.user.id}`);

  // socket.on("whoami", (cb) => {
  //   // cb(req.user.username);
  // });
});

httpServer.listen(port, () => {
  console.log(`application is running at: http://localhost:${port}`);
});
