const app = require('./app');
const dbConnect = require('./db/db-connect');
const { PORT } = require('../config/index');

dbConnect
  .then(() => app.listen(PORT, () => console.log('Listen port', PORT)))
  .catch((err) => { console.log(err); process.exit(1); });
