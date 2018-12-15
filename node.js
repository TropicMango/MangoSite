var express = require('express');
var app = express();

app.get('/', function (req, res) {
  //res.sendFile(path.join(__dirname,'index.html'));
  res.send('did i break this?');
});

app.listen(process.env.PORT || 3000);
