const express = require('express');
const tourController = require('../controllers/tour-controller');

const router = express.Router();

// router.param('id', tourController.checkId);

router.route('/').get(tourController.getAllTours).post(tourController.addTour);
router.route('/tour-status').get(tourController.gettourstats)



router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
