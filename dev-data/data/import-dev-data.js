const dotenv = require('dotenv');
const fs = require('fs');
const Tour = require('../../models/tour-model');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then((con) => {
  console.log('db connected');
});

const toursData = JSON.parse(
  fs.readFileSync(
    `${__dirname}/./tours-simple.json`,
    'utf-8',
    (err, data) => data
  )
);

//import data into db

const importData = async () => {
  try {
    await Tour.create(toursData);
    console.log('Data successfully aded');
  } catch (err) {
    console.log(err);
  }
};

//delete all data

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('all data deleted');
  } catch (err) {
    console.log(err);
  }
};

importData();

// const port = 3000;
// app.listen(port, () => console.log(`Example app listening on port ${port}!`));
