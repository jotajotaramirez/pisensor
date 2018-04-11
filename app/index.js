'use strict';

const
  HTTP_PORT = 80,
  MONGO_URL = 'mongodb://localhost:27017',
  MONGO_DB = 'sensor',
  DATA_COLLECTION = 'data';

const
  express = require('express'),
  app = express(),
  MongoClient = require('mongodb').MongoClient,
  client = new MongoClient(MONGO_URL);

// Connect to mongo
MongoClient.connect(MONGO_URL).then(client => {
  const
    db = client.db(MONGO_DB),
    dataCollection = db.collection(DATA_COLLECTION);

  // Configure data collection
  dataCollection.createIndex({ date: 1 });

  app.get('/last', function(req, res) {
    dataCollection.find().sort({ date: -1 }).limit(1).toArray()
    .then(last => res.json(last));
  });

  app.get('/mcp3008', function(req, res) {
    dataCollection.find({}, {
      projection: {
        mcp_0: 1,
        mcp_1: 1,
        mcp_2: 1,
        mcp_3: 1,
        mcp_4: 1,
        mcp_5: 1,
        mcp_6: 1,
        mcp_7: 1,
      }
    }).sort({ date: -1 }).toArray()
    .then(values => res.json(values));
  });

  app.listen(HTTP_PORT, function() {
    console.log('Server started');
  });

})
.catch(error => {
  console.error(error);
  process.exit(-1);
});

