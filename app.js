// import { initializeApp,applicationDefault } from 'firebase-admin/app';
// import { getMessaging } from "firebase-admin/messaging";
// import express,{json} from "express";
// import cors from "cors";
// import bodyParser from "body-parser";
// import cookieParser from "cookie-parser";
// import pushNotifications from "./Notifications/notification";
// import serviceAccount from "./firebase.config.json";
// import initRouter from "./Controller/attendanceController";
const express = require('express');
const {initializeApp,applicationDefault} = require('firebase-admin/app');
const  getMessaging = require('firebase-admin/messaging');
//// const db=require('./DbConfig/mysqlDbConfig');
const cors = require('cors');
const app = express();
const multer = require('multer');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const admin =require('firebase-admin');
const pushNotifications = require('./Notifications/notification');
const serviceAccount = require("./firebase.config.json");

process.env.GOOGLE_APPLICATION_CREDENTIALS;

initializeApp({
  credential:applicationDefault(),
  projectId:'rn-push-notification'
})
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// module.exports ={admin} ;

const PORT = 8080;
const initRouter= require('./Controller/attendanceController');


app.use(function(req, res, next) {
  res.setHeader("Content-Type", "application/json");
  next();
});

app.use(
  cors({
    origin: "*",
  })
);

app.use(
  cors({
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  })
);
app.post("/send", function (req, res) {
  const receivedToken = req.body.fcmToken;
  
  const message = {
    notification: {
      title: "Test Title",
      body: 'This is a Test Notification'
    },
    token: "dtK-fN21TPSyJQns3JjL8U:APA91bGzt2VIBsETAW1OcLsiJBWP3YLsn8Nm1ImHuH7NDEzNErGZ77Fx6okHrzmwbtKCcPUcWHisckYDGhXH2mvuBWOBCXu7uOv9lcPhuafrxuQlmROsPrNUqNVmA62dQcNrjo81rIjO",
  };
  
  getMessaging()
    .send(message)
    .then((response) => {
      res.status(200).json({
        message: "Successfully sent message",
        token: receivedToken,
      });
      console.log("Successfully sent message:", response);
    })
    .catch((error) => {
      res.status(400);
      res.send(error);
      console.log("Error sending message:", error);
    });
  
  
});


// const sendNotification = async()=>{
//   try{
//     await admin.messaging().send({
//       token:"c1iQSWOfQ0a2bux4A-ba_1:APA91bET0Lyp3VFz7dYkzhhewWSbhZvLEzW08GjRBeL7XIvdNs5-4bsBscu25ss4Iq2CohpDalNhNUQdFdD6OTMs2nPLVRQgPTCVAxtlitg6v4Rq-Kfimv3Sjm93j-Z7FPpezwQbOW88",
//       notification:{
//         title:"Test title",
//         body:"This is test message"
//       }
//     })
//   console.log("Notification sent successfully!!")
//   }catch(error){
//   console.log("Notification failed",error);
//   }
//   }
  
  //   setTimeout(()=>{
  //  sendNotification()
  //     },2000);
    
app.use(cors());
app.use(express.json())
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/employee',initRouter)

// app.use('/', pushNotifications)

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
  });



