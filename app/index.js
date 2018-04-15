'use strict';

const
  HTTP_PORT = 80,
  MONGO_URL = 'mongodb://localhost:27017/sensor',
  DATA_COLLECTION = 'data';

const
  express = require('express'),
  app = express(),
  ejs = require('ejs'),
  MongoClient = require('mongodb').MongoClient,
  client = new MongoClient(MONGO_URL),
  figlet = require('figlet'),
  config = require('./config');

function convertToPercentage(value, max, decimals) {
  return (value / max * 100).toFixed(decimals);
}

function generateSensorPageEndpoint(app, sensor, config) {
  let max = config.max;
  if (config[sensor].units === '%' && max !== 100) {
    max = 100;
  }

  ejs.renderFile(`${__dirname}/template/history.ejs`, {
    units: config.units,
    title: config.description,
    max: config.max,
    field: sensor,
  }, (err, page) => {
    if (err) {
      console.error(error);
      return res.status(500).send(`Error: ${err.message}`);
    }

    app.get(`/${sensor}`, function(req, res) {
      res.send(page);
    });
  });
}

function processSensorValueFromDB(sensor, dbValue) {
  const max = config[sensor].max;
  let sensorValue = dbValue;

  if (max !== undefined) {
    if (config[sensor].inverse) {
      // Sensor data is inverted so max should be 0 and the opposite
      sensorValue = max - sensorValue;
    }

    if (config[sensor].units === '%' && max !== 100) {
      // Sensor is a percentage in binary form
      sensorValue = convertToPercentage(sensorValue, max, 2);
    }
  }

  if (config[sensor].units === 'ppm') {
    // Special case for MQ135 sensor
    // TODO: Currently will just return a percentage
    sensorValue = convertToPercentage(sensorValue, max, 0);
  }

  return sensorValue;
}

figlet('PiSensor', function(err, data) {
  if (err) {
      console.log('Something went wrong with figlet...');
      console.dir(err);
      return;
  }
  console.log(data);
});

// Connect to mongo
MongoClient.connect(MONGO_URL).then(db => {
  const dataCollection = db.collection(DATA_COLLECTION);

  // Configure data collection
  dataCollection.createIndex({ date: 1 });

  app.use(express.static(`${__dirname}/static`));

  app.get('/', function(req, res) {
    dataCollection.find().sort({ date: -1 }).limit(1).toArray()
    .then(last => ejs.renderFile(`${__dirname}/template/index.ejs`, {
        date: last[0].date.toLocaleString("es-ES"),
        light: processSensorValueFromDB('light', last[0].light),
        temp1w: processSensorValueFromDB('temp1w', last[0].temp1w),
        dht22_humidity: processSensorValueFromDB('dht22_humidity', last[0].dht22_humidity),
        dht22_temperature: processSensorValueFromDB('dht22_temperature', last[0].dht22_temperature),
        mcp_0: processSensorValueFromDB('mcp_0', last[0].mcp_0),
        mcp_1: processSensorValueFromDB('mcp_1', last[0].mcp_1),
        mcp_2: processSensorValueFromDB('mcp_2', last[0].mcp_2),
        mcp_3: processSensorValueFromDB('mcp_3', last[0].mcp_3),
        mcp_4: processSensorValueFromDB('mcp_4', last[0].mcp_4),
        mcp_5: processSensorValueFromDB('mcp_5', last[0].mcp_5),
        mcp_6: processSensorValueFromDB('mcp_6', last[0].mcp_6),
        mcp_7: processSensorValueFromDB('mcp_7', last[0].mcp_7)
      }, (err, page) => {
        if (err) {
          console.error(error);
          return res.status(500).send(`Error: ${err.message}`);
        }

        res.send(page);
      }));
  });

  for (let sensor in config) {
    generateSensorPageEndpoint(app, sensor, config[sensor]);
  }

  app.get('/api/last', function(req, res) {
    dataCollection.find().sort({ date: -1 }).limit(1).toArray()
    .then(last => res.json(last));
  });

  app.get('/api/:sensor', function(req, res) {
    const query = {};
    const sensor = req.params.sensor;
    if (config[sensor] === undefined) {
      console.error(`Sensor ${sensor} not recognized`);
      return res.status(500).end();
    }

    query[sensor] = { $exists:true };
    dataCollection.find(query).sort({ date: -1 }).toArray()
    .then(values => res.json(values.map(x => {
      const sensorData = {};
      sensorData.date = x.date;
      sensorData[sensor] = processSensorValueFromDB(sensor, x[sensor]);;

      return sensorData;
    })));
  });

  app.listen(HTTP_PORT, function() {
    console.log(`Server started listening to port ${HTTP_PORT}`);
  });

})
.catch(error => {
  console.error(error);
  process.exit(-1);
});
