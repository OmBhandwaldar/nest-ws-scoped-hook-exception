# Exception in `handleConnection` of a request-scoped gateway

Minimal reproduction for NestJS: when `handleConnection` of a request-scoped gateway throws, the
error does reach the gateway's exception filter, but the filter gets the hook's raw arguments, so
`getPattern()` returns the wrong thing.

- With socket.io, the pattern is the socket itself. Encoding the error fails with
  `RangeError: Maximum call stack size exceeded` and the server process exits.
- With `ws`, the pattern and the data are the HTTP upgrade request (`IncomingMessage`), and the
  client is sent the whole request object as the error `cause` (about 8 KB).

The gateway is request-scoped because it depends on a `Scope.REQUEST` provider
(`src/events.gateway.ts`). Its `handleConnection` throws `new WsException('Unauthorized')`, as a
token check would.

Tested with `@nestjs/websockets` 12.1.2, Node.js 24.16.0, macOS.

```sh
npm install
npm run start:socket.io
npm run start:ws
```

Each script starts the app on port 3000 and connects one client.

| Adapter | Actual | Expected |
|---|---|---|
| socket.io | `RangeError: Maximum call stack size exceeded`, `server process exited with code 1` | the client receives `{"status":"error","message":"Unauthorized","cause":{"pattern":"handleConnection"}}` and the server keeps running |
| `ws` | the client receives ~8 KB: `{"event":"exception","data":{"status":"error","message":"Unauthorized","cause":{"pattern":{"_events":{},"_readableState":...` | the client receives `{"event":"exception","data":{"status":"error","message":"Unauthorized","cause":{"pattern":"handleConnection"}}}` |

The expected output has the same shape a message handler sends when it throws the same exception,
with the hook name as the pattern and no data.
