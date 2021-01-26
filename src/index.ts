import { createServer } from './server';

const app = createServer();
const port = process.env.PORT || 8080;
app.listen(port);
process.on('unhandledRejection', (e) => {
  console.error('unhandledRejection', e);
});
console.log(`listening on port ${port}...`);
