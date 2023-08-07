require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();
const mongo = require('./mongo');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // for json
app.use(express.urlencoded({ extended: true })); // for form data

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.get('/api/shorturl/:id', async function(req, res) {
  if (!req.params.id || isNaN(req.params.id)) {
    res.json({ error: 'Wrong format' });
    return
  }

  const data = await mongo.findData({short_url: parseInt(req.params.id)});
  
  if (!data.original_url) {
    res.json({ error: 'No short URL found for the given input' });
    return
  }

  res.redirect(data.original_url);
});

app.post('/api/shorturl', async function(req, res) {
  try {
    const urlObject = new URL(req.body.url);
    dns.lookup(urlObject.hostname, function (err, address, family) {
      if (err !== null) {
        throw err;
      }
    });
  } catch (e) {
    res.json({ error: 'Invalid URL' });
    return
  }

  let shortUrl = 1;
  const data = await mongo.findLastData({short_url: -1});
  
  if (data && data.short_url) {
    shortUrl = parseInt(data.short_url) + 1;
  }

  const output = {
    original_url: req.body.url,
    short_url: shortUrl
  };

  mongo.saveData(output);

  res.json(output);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
