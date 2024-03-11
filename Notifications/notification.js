const express = require('express');
const admin = require('firebase-admin');
const fcmV1Http2 = require('fcm-v1-http2');

const client = new fcmV1Http2({
  serviceAccount : require("../firebase.config.json"),
  maxConcurrentConnections: 10,
  maxConcurrentStreamsAllowed: 100

})
// const client = require('')
// const serviceAccount = require("../firebase.config.json");

// firebase.initializeApp({
//   credential: firebase.credential.cert(serviceAccount)
// });
// module.exports={firebase}

const router = express.Router();

const tokens =["dtK-fN21TPSyJQns3JjL8U:APA91bGzt2VIBsETAW1OcLsiJBWP3YLsn8Nm1ImHuH7NDEzNErGZ77Fx6okHrzmwbtKCcPUcWHisckYDGhXH2mvuBWOBCXu7uOv9lcPhuafrxuQlmROsPrNUqNVmA62dQcNrjo81rIjO"];

router.get("/test" ,(req,res)=>{
  res.send("Its Working now....");
});

//firebase another sample

router.post("/sendNotification", async (req, res) => {
  try{
    const { title, body} = req.body;
    await admin.messaging().sendEachForMulticast({
    // await client.sendMulticast({
      tokens,
        notification:{
        title,
        body,
      }
    })
    res.status(200).json({ message: "Notification sent successfully!!" });
  console.log("Notification sent successfully!!")
  }catch(error){
  
  res
  .status(error.status || 500)
  .json({ message: error.message || "Something went wrong!" });
  console.log("Notification failed",);
  }
  })
//firebase push notification
//1.register

router.post("/register", (req, res) => {
  tokens.push(req.body.token);
  res.status(200).json({ message: "Successfully registered FCM Token!" });
});


//2.send notifications
router.post("/notifications", async (req, res) => {
  try {
    const { title, body, imageUrl } = req.body;
    await admin.messaging().sendEachForMulticast({//sendMulticast ,sendEachForMulticast
    // client.sendMulticast({
    tokens,
      notification: {
        title,
        body,
        imageUrl,
      },
    });
    res.status(200).json({ message: "Successfully sent notifications!" });
    console.log("Message sent",title,body)
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ message: err.message || "Something went wrong!" });
      console.log("Error");
  }
});

// router.post('/register', (req, res) => {
//   const { token } = req.body;

//   tokens.push(token);
//   res.status(200).json({ message: "Successfully registered FCM Token!" });
// });

// router.get('/listAll', (req, res) => {
//   res.json(tokens);
// });

router.post("/notification", async (req, res) => {
  try {
    const { title, body, imageUrl, androidData } = req.body;
    await admin.messaging().sendMulticast({
      tokens: tokens,
      notification: {
        title: title,
        body: body,
        imageUrl: imageUrl,
      },
      android: {
        notification: {
          imageUrl: imageUrl
        }
      },
      apns: {
        payload: {
          aps: {
            sound: "default"
          }
        }
      },
      data: androidData
    });

    res.status(200).json({ message: "Successfully sent notifications!" });
    console.log("success")
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ message: err.message || "Something went wrong!" });
      console.log("Error")
  }
});

module.exports = router;
