var firebase = require("firebase/app");

require("firebase/auth");
require("firebase/firestore");
const dotenv = require('dotenv');
dotenv.config();
var firebaseConfig = {
    apiKey: `${process.env.API_KEY}`,
    authDomain: `${process.env.PROJECT_ID}.firebaseapp.com`,
    databaseURL: `https://${process.env.PROJECT_ID}.firebaseio.com`,
    projectId: `${process.env.PROJECT_ID}`,
    storageBucket: `${process.env.PROJECT_ID}.appspot.com`,
    messagingSenderId: `${process.env.SENDER_ID}`,
    appId: `${process.env.APP_ID}`,
    measurementId: `G-${process.env.G_MEASUREMENT_ID}`,
};

var defaultProject = firebase.initializeApp(firebaseConfig);

exports.firestore = defaultProject.firestore();

var express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./src/routes/ovinRoutes');
routes(app);


app.listen(port);


console.log(`ovin API server started on: ${port}`);