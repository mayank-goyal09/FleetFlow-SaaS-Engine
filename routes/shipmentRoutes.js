const express = require('express');
const router = express.Router();
const { createShipment, getShipmentDetails, getAllShipments, updateShipmentStatus } = require('../controllers/shipmentController');
const { protect } = require('../middleware/authMiddleware');

// All shipment routes are protected
router.use(protect);

router.route('/')
    .post(createShipment)
    .get(getAllShipments);


router.route('/:id')
    .get(getShipmentDetails)
    .patch(updateShipmentStatus);


module.exports = router;
