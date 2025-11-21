import http from 'http';
import dotenv from 'dotenv';

import createApp from './app.js';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

const app = createApp();
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export default server;
