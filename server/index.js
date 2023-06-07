require('dotenv').config();
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const { Configuration, OpenAIApi } = require('openai')
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

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.API_TOKEN,
}));

app.get('/dutchpay/openai', (req, res) => {
  openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `extract the items, item quantity, item prices, tax amount, tips, and total amount from ${req.query.data} omitting all "$" symbols in the result and ensuring that the tax amount is always less than the total. Then return the data as a JSON object that is strictly structured as such:
    {
      "items": [
        {
          "name": String,
          "quantity": Number,
          "price": String
        }, ...
      ],
      "tax": String,
      "total": String,
      "tipAmount": String,
      "suggestedGratuity": [
        {
          "option": String,
          "tipAmount": String,
          "totalAmount": String
        }, ...
      ]
    }`,
    temperature: 0.6,
    top_p: 1,
    max_tokens: 700,
  })
    .then(({ data }) => {
      console.log('OPENAI DATA', data.choices[0].text);
      res.json(data.choices[0].text);
    })
    .catch((err) => console.error(err));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server available at http://localhost:${PORT}`);
});
