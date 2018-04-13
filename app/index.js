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
  return value / 1024 * 100;
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
        light: last[0].light,
        temp1w: last[0].temp1w,
        dht22_humidity: last[0].dht22_humidity,
        dht22_temperature: last[0].dht22_temperature,
        date: last[0].date.toLocaleDateString("es-ES"),
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

  app.get('/last', function(req, res) {
    dataCollection.find().sort({ date: -1 }).limit(1).toArray()
    .then(last => res.json(last));
  });

  app.get('/mcp3008', function(req, res) {
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

  app.get('/light', function(req, res) {
    dataCollection.find().sort({ date: -1 }).toArray()
    .then(values => res.json(values.map(x => ({
      date: x.date,
      light: x.light,
    }))));
  });

  app.get('/temp1w', function(req, res) {
    dataCollection.find().sort({ date: -1 }).toArray()
    .then(values => res.json(values.map(x => ({
      date: x.date,
      temperature: x.temp1w,
    }))));
  });

  app.get('/dht22_humidity', function(req, res) {
    dataCollection.find().sort({ date: -1 }).toArray()
    .then(values => res.json(values.map(x => ({
      date: x.date,
      humidity: x.dht22_humidity,
    }))));
  });

  app.get('/dht22_temperature', function(req, res) {
    dataCollection.find().sort({ date: -1 }).toArray()
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

