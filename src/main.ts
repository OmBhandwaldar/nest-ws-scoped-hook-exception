import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { io } from 'socket.io-client';
import WebSocket from 'ws';
import { ConnectionContext, EventsGateway } from './events.gateway.js';

@Module({ providers: [ConnectionContext, EventsGateway] })
class AppModule {}

const adapter = process.argv[2] === 'ws' ? 'ws' : 'socket.io';

process.on('exit', code => console.log(`server process exited with code ${code}`));

const app = await NestFactory.create(AppModule, { logger: ['error'] });
if (adapter === 'ws') {
  app.useWebSocketAdapter(new WsAdapter(app));
}
await app.listen(3000);
console.log(`listening with the ${adapter} adapter, connecting a client...`);

if (adapter === 'ws') {
  const client = new WebSocket('ws://localhost:3000');
  client.on('message', data => {
    console.log(`client received ${data.toString().length} bytes:`);
    console.log(data.toString());
  });
} else {
  const client = io('http://localhost:3000', { transports: ['websocket'] });
  client.on('exception', error => {
    console.log('client received:', JSON.stringify(error));
  });
}

setTimeout(() => {
  console.log('server still running after 2s');
  process.exit(0);
}, 2000);
