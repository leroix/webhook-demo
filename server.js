// core
var fs = require('fs')

// vendor
var redis = require('redis')
  , express = require('express')
  , morgan = require('morgan')
  , bodyParser = require('body-parser')
  , Mustache = require('mustache')
  , xtend = require('xtend')
  , send_request = require('request')

// config
var HTML_TEMPLATE = fs.readFileSync('./index.mustache').toString()
  , redis_retry_strategy = function () { return 3000 } // retry connect after 3 seconds
  , redisClient = redis.createClient({
      url: process.env.REDIS_URL
    , retry_strategy: redis_retry_strategy
    })
  , REDIS_KEY = 'webhookTemplate'
  , PORT = process.env.PORT || 5000
  , BASE_URL = process.env.HEROKU_APP_NAME
    ? 'https://' + process.env.HEROKU_APP_NAME + '.herokuapp.com'
    : 'http://localhost:' + PORT


var app = express()

// request logging
app.use(morgan('combined'))

//
// api endpoints
//
app.get('/', function (request, response) {
  redisClient.get(REDIS_KEY, function (err, result) {
    if (err) { return response.status(503).send() }

    var form_data = JSON.parse(result)
      , defaults = {
          'entrant-id': '{{ user.id }}'
        , 'entrant-name': '{{ user.first_name }} {{ user.last_name }}'
        , 'entrant-display': '{{ user.username }}'
        , 'entry': '{{ body }}'
        , webhookUrl: BASE_URL + '/webhook'
        }

    if (request.query.saved) {
      form_data.saved = true
    }

    response.send(Mustache.render(HTML_TEMPLATE, xtend(defaults, form_data)))
  })
})

app.post('/', bodyParser.urlencoded({extended: false}), function (request, response) {
  redisClient.set(REDIS_KEY, JSON.stringify(request.body), function (err) {
    if (err) { return response.status(503).send('unable to contact upstream server') }
    
    response.redirect(303, '/?saved=true')
  })
})

app.post('/webhook', bodyParser.json(), function (request, response) {
  redisClient.get('webhookTemplate', function (err, template) {
    if (err) { return response.status(503).send('unable to contact upstream server') }

    var submission = JSON.parse(Mustache.render(template, request.body))

    send_request({
      method: 'POST'
    , url: 'http://requestb.in/1j8chuf1'
    , json: submission
    }, function (_err, resp, body) {
      response.status(resp.statusCode).json(body)
    })
  })
})


app.listen(PORT, function() {
  console.log('Node app is running');
  console.log('Access the data mapper at', BASE_URL)
  console.log('Send webhook requests to', BASE_URL + '/webhook')
});
