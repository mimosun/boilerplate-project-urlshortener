require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: 'secret',
  cookie: { maxAge: 60000 }
}));
app.use(express.json()) // for json
app.use(express.urlencoded({ extended: true })) // for form data

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.get('/api/shorturl/:id', function(req, res) {
  if (!req.params.id || isNaN(req.params.id)) {
    res.json({ error: 'Wrong format' });
    return
  }
  
  if (!req.session.shortener || !req.session.shortener.hasOwnProperty(req.params.id)) {
    res.json({ error: 'No short URL found for the given input' });
    return
  }

  res.redirect(req.session.shortener[req.params.id]);
});

app.post('/api/shorturl', function(req, res) {
  try {
    new URL(req.body.url);
  } catch (e) {
    res.json({ error: 'invalid url' });
    return
  }

  let shortUrl = 1;

  if (!req.session.shortener) {
    req.session.shortener = {};
  } else {
    shortUrl = parseInt(Object.keys(req.session.shortener).slice(-1)) + 1;
  }

  req.session.shortener[shortUrl] = req.body.url;

  res.json({
    original_url: req.body.url,
    short_url: shortUrl
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
