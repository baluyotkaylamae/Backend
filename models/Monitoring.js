const mongoose = require('mongoose');

const monitoringSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  gourdType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GourdType',
    required: true,
  },
  variety: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Variety',
    required: true,
  },
  dateOfPollination: {
    type: Date,
    required: true,
  },
  pollinatedFlowers: {
    type: Number,
    required: true,
    min: 0,
  },
  fruitsHarvested: {
    type: Number,
    default: 0,
    min: 0,
  },
  dateOfFinalization: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['In Progress', 'Completed', 'Failed'],
    default: 'In Progress',
  },
});

monitoringSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

monitoringSchema.set('toJSON', {
  virtuals: true,
});

const Monitoring = mongoose.model('Monitoring', monitoringSchema);

module.exports = Monitoring;
