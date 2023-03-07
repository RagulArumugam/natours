const dotenv = require('dotenv');
const app = require('./app');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then((con) => {
  console.log('db connected');
});

const port = 3000;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
