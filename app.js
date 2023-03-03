const express = require('express');
const morgan = require('morgan');
//
const app = express();

const tourRouter = require('./routes/tour-route');
const userRouter = require('./routes/user-route');

//middlewares
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
