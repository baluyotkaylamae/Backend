const mongoose = require('mongoose');

const gourdTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

gourdTypeSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

gourdTypeSchema.set('toJSON', {
  virtuals: true,
});

const GourdType = mongoose.model('GourdType', gourdTypeSchema);

module.exports = GourdType;
