const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.json());

// app.get('/', (req, res) => res.send('Hello World!'))

// app.post('/', (req, res) => res.send('post'))

const toursData = JSON.parse(
  fs.readFileSync(
    `${__dirname}/dev-data/data/tours-simple.json`,
    'utf-8',
    (err, data) => data
  )
);

app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: { toursData: toursData },
    results: toursData.length,
  });
});

app.get('/api/v1/tours/:id', (req, res) => {
  const tour = toursData.find((item) => item.id === req.params.id * 1);
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid Id',
    });
  }
  res.status(200).json({
    status: 'success',
    data: { data: tour },
  });
});

app.post('/api/v1/tours', (req, res) => {
  const newTour = Object.assign({ id: toursData.length + 1 }, req.body);
  console.log(newTour);
  toursData.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(toursData),
    (err) => {
      if (!err) {
        res.status(201).json({
          status: 'success',
          data: newTour,
        });
      }
    }
  );

  app.pacth('/api/v1/tours/:id', (req, res) => {
    if (!tour) {
      return res.status(404).json({
        status: 'fail',
        message: 'invalid Id',
      });
    }
    res.status(200).json({
      status: 'success',
      data: 'Tour updated',
    });
  });

  app.delete('/api/v1/tours/:id', (req, res) => {
    if (!tour) {
      return res.status(404).json({
        status: 'fail',
        message: 'invalid Id',
      });
    }
    res.status(204 ).json({
      status: 'success',
      data: 'Tour Deleted',
    });
  });
  // res.status(200).json({
  //   status: 'success',
  //   data: { toursData: toursData },
  //   results: toursData.length,
  // });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
