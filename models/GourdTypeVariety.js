const mongoose = require('mongoose');

const varietySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  gourdType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GourdType',
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

varietySchema.virtual('id').get(function () {
  return this._id.toHexString();
});

varietySchema.set('toJSON', {
  virtuals: true,
});

const Variety = mongoose.model('Variety', varietySchema);

module.exports = Variety;
