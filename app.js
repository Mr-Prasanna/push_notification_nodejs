const express = require('express');
// const db=require('./DbConfig/mysqlDbConfig');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// Port Number
const PORT = 8080;
const initRouter= require('./Controller/attendanceController');
app.use(cors());
app.use(express.json())
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/employee',initRouter)

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
  });



