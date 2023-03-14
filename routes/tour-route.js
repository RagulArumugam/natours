const express = require('express');
const tourController = require('../controllers/tour-controller');
const authController = require('../controllers/auth-controller');

const router = express.Router();

// router.param('id', tourController.checkId);

router.route('/').get(authController.protect,tourController.getAllTours).post(tourController.addTour);
router.route('/tour-status').get(tourController.gettourstats)
router.route('/motnhlystatus/:year').get(tourController.getMotnhlyStatus)



router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
