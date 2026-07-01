import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  
import { Server, Socket } from 'socket.io';
import { ConnectionManager } from '../manager/connection.manager';

@WebSocketGateway({
    cors:{
        origin:"*"
    },
})
export class PvpGateway implements OnGatewayConnection, OnGatewayDisconnect{

    constructor(
        private readonly connectionManager: ConnectionManager,
    ){}

    @WebSocketServer()
    server: Server;
  
    handleConnection(client: Socket) {
      console.log(`${client.id} connected`);
    }
  
    handleDisconnect(client: Socket) {
      console.log(`${client.id} disconnected`);
    }
  
    @SubscribeMessage('ping')
    handlePing(
      @ConnectedSocket() client: Socket,
      @MessageBody() body: any,
    ) {
      console.log(body);
  
      client.emit('pong', {
        message: 'Hello',
      });
    }
}