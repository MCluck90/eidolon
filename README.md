# eidolon

A simple way to automate tasks in a headless browser.

## Install

```bash
$ npm install eidolon
```

## How it Works

Eidolon works through a series of "steps" defined in a configuration file and, optionally, paired with a data file.

## Example

Here is a basic example of performing a search using Google

#### Configuration: google.json

```js
{
    "name": "Example Job",
    "initURL": "https://www.google.com",
    "steps": [
        {
            "name": "Google 'Google'",
            "confirm": {
                "selector": "title",
                "attribute": "text",
                "value": "Google"
            },
            "link": {
                "selector": "form[action='/search']",
                "submit": true
            }
        },
        {
            "name": "Click First Result",
            "confirm": {
                "selector": "h3.r",
                "exists": true
            },
            "link": {
                "selector": "h3.r:first-child a",
                "follow": true
            }
        }
    ]
}
```

#### Data: google-data.json
```js
{
    "name": "Example Job",
    "steps": [
        {
            "name": "Google 'Eidolon'",
            "fields": {
                "input[name='q']": {
                    "value": "Eidolon",
                    "keypress": true,
                    "enter": true
                }
            }
        }
    ]
}
```

#### app.js
```js
var eidolon = require('eidolon');

eidolon.createJob({
    autostart: true,
    configPath: require.resolve('./google.json'),
    dataPath: require.resolve('./google-data.json')
});
```

This will run a job which searches Google for "Eidolon."

More comprehensive documentation coming later.