import { redisService } from "../services/redis";
import { OutgoingMessages, IncomingMessages } from "../constants/messages";
import { Socket } from "socket.io";
import { UserJoinedDoc } from "../messages/user-joined-doc";
import { UserLeftDoc } from "../messages/user-left-doc";
import { UserPositionChanged } from "../messages/user-position-changed";
import { ElementUpdated, RectChangesMap, ElementType } from "../messages/element-updated";

export class CollaborationController {
    private readonly socket: Socket;
    private readonly userId: string;

    constructor(socket: Socket) {
        this.socket = socket;
        this.userId = this.computeUserId(socket);
    }

    private computeUserId(socket: {id: string}) {
        return socket.id;
    }

    async onUserJoinedDoc(message: UserJoinedDoc) {
        let stateExists = await redisService.client.exists(`state-${message.docId}`);
        if (!stateExists) {
          await redisService.client.json.SET(`state-${message.docId}`,'$', { elements: {}});
        } 
        this.socket.join(message.docId);
        this.socket.to(message.docId).emit(OutgoingMessages.USER_JOINED_DOC, {userId: this.userId});
    }

    async onUserLeftDoc(message: UserLeftDoc) {
        this.socket.to(message.docId).emit(IncomingMessages.USER_LEFT_DOC, {
            userId: this.userId, 
            docId: message.docId
        });
        this.socket.leave(message.docId);
    }

    async onUserPositionChanged(message: UserPositionChanged) {
        this.socket.to(message.docId).emit(OutgoingMessages.STATE_UPDATED, {
          users: { [this.userId]: {x: message.x, y: message.y}},
          docId: message.docId
        });
    }

    async onElementUpdated(message: ElementUpdated) {
        const transaction = redisService.client.multi();

        transaction.json.SET(`state-${message.docId}`, `$.elements.${message.elementId}`, {x: 0, y: 0}, {NX: true});
        if (message.changesMap.x) 
          transaction.json.SET(`state-${message.docId}`, `$.elements.${message.elementId}.x`, message.changesMap.x);
        if (message.changesMap.y) 
          transaction.json.SET(`state-${message.docId}`, `$.elements.${message.elementId}.y`, message.changesMap.y);
        if (message.changesMap.color) 
          transaction.json.SET(`state-${message.docId}`, `$.elements.${message.elementId}.color`, message.changesMap.color);
        
        if (message.type === ElementType.RECT) {
            const changesMap = message.changesMap as RectChangesMap;
            if (changesMap.size) {
                transaction.json.SET(`state-${message.docId}`, `$.elements.${message.elementId}.size`, changesMap.size);
            }
        }
        await transaction.exec();
        this.socket.to(message.docId).emit(OutgoingMessages.STATE_UPDATED, {
            elements: { [message.elementId]: {...message.changesMap}},
            docId: message.docId
        });  
    }

    onDisconnect() {
        console.log("disconnecting");
        for (const room of this.socket.rooms) {
          if (room !== this.socket.id) {
            this.socket.to(room).emit(OutgoingMessages.USER_LEFT_DOC, {
                userId: this.userId, 
                docId: room
            });
          }
        }
    }
}