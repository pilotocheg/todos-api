const mongoose = require('mongoose');

const taskShema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 50,
    required: true,
  },
  description: String,
  timestamp: { type: Date, default: new Date().toISOString() },
});

taskShema.set('toObject', {
  versionKey: false,
  transform(doc, ret) {
    const returnedObj = ret;
    returnedObj.id = String(ret._id);
    delete returnedObj._id;
    returnedObj.timestamp = ret.timestamp.toISOString();
    return ret;
  },
});

taskShema.statics.isForbiddenParams = (obj) => {
  for (const i in obj) {
    if (i === 'timestamp' || i === 'id') throw new Error(i);
  }
  return true;
};

taskShema.statics.checkQueryParams = (query, paramsObj) => {
  const params = paramsObj;
  if (query) {
    if (['name', 'description', 'timestamp'].includes(query.sortBy)) {
      params.sort = {};
      params.sort[query.sortBy] = (['asc', 'desc'].includes(query.sortOrder) ? query.sortOrder : 'desc');
    }
    if (query.limit && Number(query.limit)) params.limit = Number(query.limit);
    if (query.offset && Number(query.offset)) params.skip = Number(query.offset);
  }
};

module.exports = mongoose.model('Task', taskShema);
