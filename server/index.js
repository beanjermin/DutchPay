require('dotenv').config();
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const { save, getById, removeSession } = require('./db');

const app = express();
app.use(morgan('dev'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, '../client/dist')));

app.post('/dutchpay', (req, res) => {
  save(req.body)
    .then((result) => res.status(201).send(result))
    .catch((err) => {
      console.error('There was a problem saving session data', err);
      res.status(500);
    });
});
app.get('/dutchpay', (req, res) => {
  getById(req.query)
    .then((data) => res.send(data))
    .catch((err) => {
      console.error('There was a problem retrieving session data', err);
      res.status(500);
    });
});
app.delete('/dutchpay', (req, res) => {
  removeSession(req.body)
    .then((result) => res.send(result))
    .catch((err) => {
      console.error('There was a problem deleting session data', err);
      res.status(500);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server available at http://localhost:${PORT}`);
});
