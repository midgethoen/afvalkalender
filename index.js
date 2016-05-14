var express = require('express');
var scrape = require('./scrape');
var app     = express();

var calendars = {};

app.get('/', function(req, res){
})

app.get('/afvalcalendar.ical', function (req, res) {
});

app.listen('8081');

exports = module.exports = app;
