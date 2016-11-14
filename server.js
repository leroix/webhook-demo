// core
var fs = require('fs')

// vendor
var express = require('express')
  , morgan = require('morgan')
  , bodyParser = require('body-parser')
  , Mustache = require('mustache')
  , xtend = require('xtend')
  , send_request = require('request')

// config
var HTML_TEMPLATE = fs.readFileSync('./index.mustache').toString()
  , WEBHOOK_TEMPLATE = fs.readFileSync('./EDIT-ME.webhook-format.mustache').toString()
  , PORT = process.env.PORT || 5000
  , BASE_URL = process.env.BASE_URL
    ? process.env.BASE_URL
    : process.env.HEROKU_APP_NAME
      ? 'https://' + process.env.HEROKU_APP_NAME + '.herokuapp.com'
      : 'http://localhost:' + PORT


var app = express()

// request logging
app.use(morgan('combined'))

//
// api endpoints
//
app.get('/', function (request, response) {
  var html = Mustache.render(HTML_TEMPLATE, {
    webhookUrl: BASE_URL + '/webhook'
  , webhookTemplate: WEBHOOK_TEMPLATE
  })

  response.send(html)
})

app.post('/webhook', bodyParser.json(), function (request, response) {
  var submission = JSON.parse(Mustache.render(WEBHOOK_TEMPLATE, request.body))

  coerceTimeField(submission)

  send_request({
    method: 'POST'
  , url: 'http://requestb.in/1ignopr1'
  , json: submission
  }, function (_err, resp, body) {
    response.status(resp.statusCode).json(body)
  })
})


app.listen(PORT, function() {
  console.log('Node app is running');
  console.log('Instructions available at', BASE_URL)
  console.log('Send webhook requests to', BASE_URL + '/webhook')
});


// util
function coerceTimeField(submission) {
  var datetime

  // if time field is a string, assume it's iso8601
  if (typeof submission.time === 'string') {
    datetime = new Date(submission.time)
    submission.time = +datetime
  }

  // otherwise, assume it's a millisecond unix timestamp and do nothing
}
