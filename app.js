const express = require('express');
const morgan = require('morgan');
const AppError = require("./utilities/appError");
const ErrorController = require("./controllers/error-controller")
//
const app = express();

const tourRouter = require('./routes/tour-route');
const userRouter = require('./routes/user-route');

//middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);


app.all('*', (req,res,next) => {
  next(new AppError(`${req.originalUrl} url Not Found`,404));
});

// by providing 4 paramaters express consider it as error handling middleware
app.use(ErrorController);

module.exports = app;
