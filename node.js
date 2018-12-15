var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.sendFile('template/index.html', {root: __dirname});
});

app.get('/nav.html', function (req, res) {
  res.sendFile('template/nav.html', {root: __dirname});
});


app.listen(process.env.PORT || 3000);
