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
  client = new MongoClient(MONGO_URL);

function convertToPercentage(value) {
  return (value / 1024 * 100).toFixed(2);
}

function generateSensorPageEndpoint(app, sensor, units, title, percentage = false) {
  app.get(`/${sensor}`, function(req, res) {
    ejs.renderFile(`${__dirname}/template/all.ejs`, {
        units,
        title,
        percentage,
        field: sensor,
      }, (err, page) => {
        if (err) {
          console.error(error);
          return res.status(500).send(`Error: ${err.message}`);
        }

        res.send(page);
      });
  });
}

// Connect to mongo
MongoClient.connect(MONGO_URL).then(db => {
  const dataCollection = db.collection(DATA_COLLECTION);

  // Configure data collection
  dataCollection.createIndex({ date: 1 });

  app.use(express.static(`${__dirname}/static`));

  app.get('/', function(req, res) {
    dataCollection.find().sort({ date: -1 }).limit(1).toArray()
    .then(last => ejs.renderFile(`${__dirname}/template/index.ejs`, {
        light: last[0].light.toFixed(0),
        temp1w: last[0].temp1w.toFixed(2),
        dht22_humidity: last[0].dht22_humidity.toFixed(2),
        dht22_temperature: last[0].dht22_temperature.toFixed(2),
        date: last[0].date.toLocaleString("es-ES"),
        mcp_0: convertToPercentage(last[0].mcp_0),
        mcp_1: convertToPercentage(last[0].mcp_1),
        mcp_2: convertToPercentage(last[0].mcp_2),
        mcp_3: convertToPercentage(last[0].mcp_3),
        mcp_4: convertToPercentage(last[0].mcp_4),
        mcp_5: convertToPercentage(last[0].mcp_5),
        mcp_6: convertToPercentage(last[0].mcp_6),
        mcp_7: convertToPercentage(last[0].mcp_7)
      }, (err, page) => {
        if (err) {
          console.error(error);
          return res.status(500).send(`Error: ${err.message}`);
        }

        res.send(page);
      }));
  });

  generateSensorPageEndpoint(app, 'light', 'lux', 'Histórico del sensor de luz');
  generateSensorPageEndpoint(app, 'temp1w', 'ºC', 'Histórico del sensor de temperatura exterior');
  generateSensorPageEndpoint(app, 'dht22_humidity', '%', 'Histórico del sensor de humedad');
  generateSensorPageEndpoint(app, 'dht22_temperature', 'ºC', 'Histórico del sensor de temperatura interior');
  for (let i = 0; i < 6; i++) {
    generateSensorPageEndpoint(app, `mcp_${i}`, '%', `Histórico del sensor de humedad en tierra ${i + 1}`, true);
  }
  generateSensorPageEndpoint(app, 'mcp_6', '%', 'Histórico del sensor de lluvia', true);
  generateSensorPageEndpoint(app, 'mcp_7', 'ppm', 'Histórico del sensor de calidad del aire', true);


  app.get('/api/last', function(req, res) {
    dataCollection.find().sort({ date: -1 }).limit(1).toArray()
    .then(last => res.json(last));
  });

  app.get('/api/:sensor', function(req, res) {
    const query = {};
    query[req.params.sensor] = { $exists:true };
    dataCollection.find(query).sort({ date: -1 }).toArray()
    .then(values => res.json(values.map(x => {
      const sensorData = {};
      sensorData.date = x.date;
      if (req.query.percentage === 'true') {
        sensorData[req.params.sensor] = convertToPercentage(x[req.params.sensor]);
      }
      else {
        sensorData[req.params.sensor] = x[req.params.sensor];
      }
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
