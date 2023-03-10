const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');


process.on("uncaughtException", err => {
  // close the server
  server.close(() => {
    //shuttingdown the application
    process.exit(1);
  })
})

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then((con) => {
  console.log('db connected');
});

const port = 3000;
const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

process.on("unhandledRejection", err => {
  // close the server
  server.close(() => {
    //shuttingdown the application
    process.exit(1);
  })
})
