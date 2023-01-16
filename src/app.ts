import express, { Express } from 'express';
import dotenv from 'dotenv';
import http from 'http';

import { initSocketIo } from './services/socketio';
import { redisService } from './services/redis';
import { stateRouter } from './routers/state-router';

dotenv.config();

const app: Express = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());
app.use('/state', stateRouter);

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

process.on('uncaughtException', (err) => {
  console.log(`uncaughtException: ${err}`);
  console.log(err.stack);
});

process.on('exit',() => {
  console.log('Disconnecting from redis....')
  redisService.disconnect();
})

process.on('SIGINT', function() {
  console.log("Caught interrupt signal");
  process.exit();
});


redisService.connect()
.then(() => initSocketIo(server))
.catch((err) => {
  console.error(err);
  process.exit(1);
});