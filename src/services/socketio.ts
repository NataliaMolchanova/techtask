import { Server, Socket } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { UserJoinedDoc } from '../messages/user-joined-doc';
import { UserLeftDoc } from '../messages/user-left-doc';
import { UserPositionChanged } from '../messages/user-position-changed';
import { OutgoingMessages, IncomingMessages } from '../constants/messages';

import http from 'http';
import { ElementUpdated, ElementType, RectChangesMap } from '../messages/element-updated';
import { redisService } from './redis';
import { CollaborationController } from '../controllers/collaboration.controller';

export const initSocketIo = (srv: undefined | http.Server ) => {
  const io = new Server(srv);
  const pubClient = createClient({
      username: process.env.REDIS_USERNAME || 'default',
      password: process.env.REDIS_PASSWORD || 'super_secure_password',
      socket: {
          host: process.env.REDIS_HOST || 'localhost',
          port: Number.parseInt(process.env.REDIS_PORT || "6379") 
      }
  });
  const subClient = pubClient.duplicate();

  return Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
    io.adapter(createAdapter(pubClient, subClient));
    io.on('connection', (socket: Socket) => {
      const controller = new CollaborationController(socket);
      
      socket.on(IncomingMessages.USER_JOINED_DOC, async (msg) => await controller.onUserJoinedDoc(msg));

      socket.on(IncomingMessages.USER_LEFT_DOC, async (msg) => await controller.onUserLeftDoc(msg));
  
      socket.on(IncomingMessages.USER_POSITION_CHANGED, async (msg) => await controller.onUserPositionChanged(msg));

      socket.on(IncomingMessages.ELEMENT_UPDATED, async (msg) => await controller.onElementUpdated(msg));
  
      socket.on("disconnecting", () => controller.onDisconnect());
    });
    return io;
  });
}

