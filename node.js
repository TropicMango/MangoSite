var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.sendFile('src/template/index.html', {root: __dirname});
});

app.get('/project', function (req, res) {
  res.sendFile('src/template/project.html', {root: __dirname});
});

app.get('/about', function (req, res) {
  res.sendFile('src/template/AboutMe.html', {root: __dirname});
});

app.get('/contact', function (req, res) {
  res.sendFile('src/template/contact.html', {root: __dirname});
});

app.listen(process.env.PORT || 3000);
