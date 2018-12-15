var express = require('express');
var app = express();

app.get('/', function (req, res) {
  
  res.sendFile('template/index.html', {root: __dirname});
  //res.send('Mango site :3');
});

app.listen(process.env.PORT || 3000);
