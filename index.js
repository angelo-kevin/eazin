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

app.post('/review', async function (req, res){
  const param = req.body

  if (param){
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: true,
    });
    client.connect();

    const col = []
    const values = []
    let sum = 0
    let count = 0

    Object.keys(param).forEach(function(key){
      let val = param[key]

      if (key == "npsn" || key == "komentar" || key == "user_id"){}
      else{
        val = parseInt(val)
        sum += val
        count++
      }
      col.push(key)
      if (key == "komentar"){
        values.push("E" + SqlString.escape(val))
      } else{
        values.push(SqlString.escape(val))
      }
    })

    const time = new Date()
    const nilai = sum/count
    col.push("tanggal", "nilai_rata", "likes", "dislikes")
    values.push(SqlString.escape(time), nilai, 0, 0)

    const query = `INSERT INTO review_sekolah(` + col.join(", ") + `)
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

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  if (baseURL) {
    console.log(`listening on ${baseURL}:${port}`);
  } else {
    console.log(`listening on localhost:${port}`);
  }
});