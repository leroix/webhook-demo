# webhook demo

Fork this repo and edit `EDIT-ME.webhook-format.mustache` to fit the service that you'll be accepting webhooks from. You may need to refer to your service's documentation. For examples of templates for a few popular services, look inside the [webhook-format-examples](webhook-format-examples/) folder. Note: the time field may be either an iso8601 string (e.g. 2011-09-06T17:26:27Z) or a millisecond unix timestamp (e.g. 1315329987000). If it's the former, include quotes around it. If the latter, do not include quotes.

Deploy the app using the button below. Give the app a name, and make sure that `HEROKU_APP_NAME` matches the given name.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)
