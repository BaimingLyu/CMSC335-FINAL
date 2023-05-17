//import axios from 'axios';
const path = require("path");
const axios = require('axios');
require("dotenv").config({ path: path.resolve(__dirname, 'credentialsDontPost/.env') })  
const express = require("express"); /* Accessing express module */
const app = express(); /* app is a request handler function */
const fs = require("fs");
const statusCode = 200;
const bodyParser = require("body-parser");
const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const dbName = process.env.MONGO_DB_NAME;
const collectionName = process.env.MONGO_COLLECTION;


const { MongoClient, ServerApiVersion } = require('mongodb');
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");
const databaseAndCollection = {db: dbName, collection:collectionName};
process.stdin.setEncoding("utf8");

async function main() {
    const uri = `mongodb+srv://${userName}:${password}@cluster0.nz90yts.mongodb.net/?retryWrites=true&w=majority`
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    if (process.argv.length != 3) {
        process.stdout.write("Usage summerCampServer.js portNumber(use one that works for you)");
        process.exit(1);
    }
    var portNumber = parseInt(process.argv[2])
    console.log(`Web server stated and running at: http://localhost:${portNumber}`);
    const prompt = "stop to shutdown the server: ";
    process.stdout.write(prompt);
    process.stdin.on("readable", function () {
        let dataInput = process.stdin.read();
        if (dataInput !== null) {
          let command = dataInput.trim();
          if (command === "stop") {
            process.stdout.write("Shutting down the server\n");
            process.exit(0);
          } else {
            process.stdout.write(`Invalid command: ${dataInput}\n`);
          }
          process.stdout.write(prompt);
          process.stdin.resume();
        }
    });

    app.get("/", (request, response) => { 
        response.render("index");
    });
    app.get("/getWeather", (request, response) => {
        portNumber = process.argv[2];
        let answer = "",home = "";
        answer += `<form id = "formAddUser" action= "http://localhost:${portNumber}/getWeather" method="post" name = "myform">`
        home += `<a href="http://localhost:${portNumber}">Home</a>`
        const variables = {formHeading: answer,homelink : home};
        response.render("form",variables);
    });
    app.use(bodyParser.urlencoded({extended:false}));
    app.post("/getWeather", async (request, response) => {
      const {latitude, longitude} = request.body;
      //const variables = {studentName: name, eAddress: email, gpaNum: gpa, backInfor: backgroundInfor}
      const options = {
        method: 'GET',
        url: 'https://weatherapi-com.p.rapidapi.com/current.json',
        params: {
          q: '21.262, -157.806'
        },
        headers: {
          'X-RapidAPI-Key': '26821ea081msh250e3b050248c37p178c06jsnd0f073ec17c7',
          'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
        }
      };
      const weatherData = await axios.request(options);
      console.log(weatherData.data.current.condition.text)
      const currentCondition = weatherData.data.current.condition.text;
      let home = `<a href="http://localhost:${portNumber}">Home</a>`;
      const variables = {latitude:latitude,longitude: longitude,currentCondition: currentCondition, homeTest1: home};

      let weather1 = {latitude:latitude,longitude: longitude,currentCondition: currentCondition};
      await insertWeather(client, databaseAndCollection, weather1);
      response.render("processApply",variables);
    });  
  app.listen(portNumber);
}

async function insertWeather(client, databaseAndCollection, newWeather) {
  const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(newWeather);
  console.log(`Weather created with id ${result.insertedId}`);
}


main().catch(console.error);