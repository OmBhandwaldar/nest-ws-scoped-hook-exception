import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WsException,
} from '@nestjs/websockets';

// Any request-scoped dependency makes the gateway request-scoped too.
@Injectable({ scope: Scope.REQUEST })
export class ConnectionContext {
  constructor(@Inject(REQUEST) readonly client: object) {}
}

@WebSocketGateway()
export class EventsGateway implements OnGatewayConnection {
  constructor(
    @Inject(ConnectionContext) private readonly context: ConnectionContext,
  ) {}

  handleConnection() {
    // e.g. a missing or invalid token
    throw new WsException('Unauthorized');
  }
}
