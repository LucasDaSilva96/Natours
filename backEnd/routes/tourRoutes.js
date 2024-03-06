const express = require('express');
const {
  getAllTours,
  createNewTour,
  getSpecificTour,
  updateTour,
  deleteTour,
} = require('../controllers/tourController');

const router = express.Router();

// ** Param Middleware
// router.param('id', checkID);

router.route('/').get(getAllTours).post(createNewTour);
router.route('/:id').get(getSpecificTour).patch(updateTour).delete(deleteTour);

module.exports = router;
