require('dotenv').config();
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const { Configuration, OpenAIApi } = require('openai');
const { save, getById, removeSession } = require('./db');

app.use(cors());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

const server = http.createServer(app);
server.listen(3001, () => {
  console.log('IO Server is connected on PORT 3001');
});
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('User is connected: ', socket.id);

  socket.on('join_room', (roomId, username) => {
    socket.join(roomId);
    console.log('1');
    socket.broadcast.emit('user_joined', username);
    console.log('2');
  });
  socket.on('update_user_list', (users, code) => {
    console.log('this shiett is happening in server', users);
    console.log('code', code);
    // console.log('rooomm info', io.in(code))
    socket.broadcast.emit('user_list', users);
    console.log('bruh cmon');
  });
  socket.on('update_select_user', (pairs, e) => {
    socket.broadcast.emit('update_select', pairs, e);
  });
  socket.on('split_page', (pairs) => {
    socket.emit('userPairs', pairs);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id);
  });
});

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
    prompt: `Intuitively extract the items, item quantity, item prices, tax amount, tips, and total amount from ${req.query.data} omitting all "$" symbols in the result and ensure that the tax amount is a reasonable number. Then return the data as a JSON object that is strictly structured as such:
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
    temperature: 0.3,
    max_tokens: 2049,
  })
    .then(({ data }) => {
      console.log('OPENAI DATA', data.choices[0].text);
      res.json(data.choices[0].text);
    })
    .catch((err) => console.error(err));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Express server available at http://localhost:${PORT}`);
});
