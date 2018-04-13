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

function generateMCPEndpoint(app, index, sensorName) {

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

  app.get('/light', function(req, res) {
    ejs.renderFile(`${__dirname}/template/all.ejs`, {
        title: "Histórico del sensor de luz",
        field: "light",
        units: "lux",
      }, (err, page) => {
        if (err) {
          console.error(error);
          return res.status(500).send(`Error: ${err.message}`);
        }

        res.send(page);
      });
  });

  app.get('/temp1w', function(req, res) {
    ejs.renderFile(`${__dirname}/template/all.ejs`, {
        title: "Histórico del sensor de temperatura exterior",
        field: "temp1w",
        units: "ºC",
      }, (err, page) => {
        if (err) {
          console.error(error);
          return res.status(500).send(`Error: ${err.message}`);
        }

        res.send(page);
      });
  });

  app.get('/api/last', function(req, res) {
    dataCollection.find().sort({ date: -1 }).limit(1).toArray()
    .then(last => res.json(last));
  });



  app.get('/api/mcp_0', function(req, res) {
    dataCollection.find().sort({ date: -1 }).toArray()
    .then(values => res.json(values.map(x => ({
      date: x.date,
      mcp_0: x.mcp_0,
      mcp_1: x.mcp_1,
      mcp_2: x.mcp_2,
      mcp_3: x.mcp_3,
      mcp_4: x.mcp_4,
      mcp_5: x.mcp_5,
      mcp_6: x.mcp_6,
      mcp_7: x.mcp_7,
    }))));
  });

  app.get('/api/:sensor', function(req, res) {
    const query = {};
    query[req.params.sensor] = { $exists:true };
    dataCollection.find(query).sort({ date: -1 }).toArray()
    .then(values => res.json(values.map(x => {
      const sensorData = {};
      sensorData.date = x.date;
      sensorData[req.params.sensor] = x[req.params.sensor];
      return sensorData;
    })));
  });

  app.get('/api/temp1w', function(req, res) {
    dataCollection.find({ temp1w: { $exists:true } }).sort({ date: -1 }).toArray()
    .then(values => res.json(values.map(x => ({
      date: x.date,
      temperature: x.temp1w,
    }))));
  });

  app.get('/api/dht22_humidity', function(req, res) {
    dataCollection.find({ dht22_humidity: { $exists:true } }).sort({ date: -1 }).toArray()
    .then(values => res.json(values.map(x => ({
      date: x.date,
      humidity: x.dht22_humidity,
    }))));
  });

  app.get('/api/dht22_temperature', function(req, res) {
    dataCollection.find({ dht22_temperature: { $exists:true } }).sort({ date: -1 }).toArray()
    .then(values => res.json(values.map(x => ({
      date: x.date,
      temperature: x.dht22_temperature,
    }))));
  });

  app.listen(HTTP_PORT, function() {
    console.log(`Server started listening to port ${HTTP_PORT}`);
  });

})
.catch(error => {
  console.error(error);
  process.exit(-1);
});

