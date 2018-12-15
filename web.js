var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.sendFile(path.join(__basedir + '/index.html'));
});

app.listen(process.env.PORT || 3000);
