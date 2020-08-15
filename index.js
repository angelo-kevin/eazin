'use strict';
require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const ngrok = require('ngrok');
const cors = require('cors')
let SqlString = require('sqlstring')
const {Client} = require('pg');

// base URL for webhook server
let baseURL = process.env.BASE_URL;

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// use body parser for POST operations
app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))

// cors
app.use(cors())

// serve static and downloaded files
app.use('/static', express.static('static'));
app.use('/downloaded', express.static('downloaded'));

app.get('/', (req, res) => res.end(`Listening...`));

// webhook callback
app.post('/profile', async function (req, res){
  const param = req.body

  if (param){
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: true,
    });
    client.connect();

    const col = []
    const values = []

    Object.keys(param).forEach(function(key){
      col.push(key)
      values.push(SqlString.escape(param[key]))
    })

    const query = `INSERT INTO profile (` + col.join(", ") + `)
      VALUES (` + values.join(", ") + `)`

    try {
      const result = await client.query(query);
      res.json({
        success: true
      })
    } catch(err) {
      console.log(err);
      res.json({
        success: false,
        error: {
          message: err.message
        }
      });
    }
    client.end();
  }
})

app.get('/task', async function (req, res) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  });
  client.connect();

  let query = `SELECT * FROM task`

  try {
    const result = await client.query(query);
    res.json({
      success: true,
      data: result.rows,
    })
  } catch(err) {
    console.log(err);
    res.json({
      success: false,
      error: {
        message: err.message
      }
    });
  }
  client.end();
});

app.get('/module', async function (req, res) {
  const param = req.query

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  });
  client.connect();

  let query = `SELECT * FROM module`

  if (param["id"]){
    query = `SELECT * FROM module WHERE id = ` + param["id"]
  }

  try {
    const result = await client.query(query);
    res.json({
      success: true,
      data: result.rows,
    })
  } catch(err) {
    console.log(err);
    res.json({
      success: false,
      error: {
        message: err.message
      }
    });
  }
  client.end();
});

app.get('/news', async function (req, res) {
  const param = req.query

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  });
  client.connect();

  let query = `SELECT * FROM news`

  if (param["id"]){
    query = `SELECT * FROM news WHERE id = ` + param["id"]
  }

  try {
    const result = await client.query(query);
    res.json({
      success: true,
      data: result.rows,
    })
  } catch(err) {
    console.log(err);
    res.json({
      success: false,
      error: {
        message: err.message
      }
    });
  }
  client.end();
});

app.get('/profile', async function (req, res) {
  const param = req.query

  if (param){
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: true,
    });
    client.connect();

    query = `SELECT * FROM profile WHERE id = ` + param["id"]

    try {
      const result = await client.query(query);
      res.json({
        success: true,
        data: result.rows,
      })
    } catch(err) {
      console.log(err);
      res.json({
        success: false,
        error: {
          message: err.message
        }
      });
    }
    client.end();
  }
});

app.put('/task', async function (req, res){
  const param = req.body

  if (param){
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: true,
    });
    client.connect();

    const key = Object.keys(param)[0]
    const val = param[key]

    const query = `UPDATE task SET status = ` + val + ` WHERE id = ` + key

    try {
      const result = await client.query(query);
      res.json({
        success: true
      })
    } catch(err) {
      console.log(err);
      res.json({
        success: false,
        error: {
          message: err.message
        }
      });
    }
    client.end();
  }
})

app.put('/module', async function (req, res){
  const param = req.body

  if (param){
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: true,
    });
    client.connect();

    const key = Object.keys(param)[0]
    const val = param[key]

    const query = `UPDATE module SET status = ` + val + ` WHERE id = ` + key

    try {
      const result = await client.query(query);
      res.json({
        success: true
      })
    } catch(err) {
      console.log(err);
      res.json({
        success: false,
        error: {
          message: err.message
        }
      });
    }
    client.end();
  }
})

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  if (baseURL) {
    console.log(`listening on ${baseURL}:${port}`);
  } else {
    console.log(`listening on localhost:${port}`);
  }
});