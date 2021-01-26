import { createServer } from './server';

const app = createServer();
const port = process.env.PORT || 8080;
app.listen(port);
console.log(`listening on port ${port}...`);
