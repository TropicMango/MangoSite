var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.sendFile('src/template/index.html', {root: __dirname});
});

app.get('/nav.html', function (req, res) {
  res.sendFile('src/template/nav.html', {root: __dirname});
});

app.get('/style/include.js', function (req, res) {
  res.sendFile('src/style/include.js', {root: __dirname});
});


app.listen(process.env.PORT || 3000);
