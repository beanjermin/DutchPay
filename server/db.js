// ================= Database and Models =================
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/dutchpay', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// ============= Authenticate Connection =================
db.on('error', console.error.bind(console, 'Connection Error'));
db.once('open', () => console.log('Connection Successful'));

// ============= Define a Schema =================
const sessionSchema = mongoose.Schema({
  sessionId: { type: String, unique: true },
  sessionUsers: [String],
  receiptInfo: String,
  itemList: String,
});

// ============= Create a Model =================
const Session = mongoose.model('Session', sessionSchema);

module.exports = {
  save: (sesh) => {
    console.log('SESHHH', sesh);
    return Session.findOneAndUpdate({ sessionId: sesh.sessionId }, { $push: { sessionUsers: sesh.sessionUsers }, receiptInfo: sesh.receiptInfo, itemList: sesh.itemList }, { upsert: true })
  },
  getById: (sesh) => Session.findOne({ sessionId: sesh.sessionId }).exec(),
  removeSession: (sesh) => Session.deleteOne({ sessionId: sesh.sessionId }),
};
