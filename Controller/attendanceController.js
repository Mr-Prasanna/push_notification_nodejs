const express = require('express');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const db=require('../DbConfig/mysqlDbConfig');
const router = express.Router();
const tokens=[];
router.get("/test" ,(req,res)=>{
    res.send("Its Working....");
});

//show attendance

router.post("/showAttendance", (req, res) => {
    res.setHeader('mysql', { "Content-Type": 'application/json' });
    //  const { empid, date, dateTo } = req.query;
    const empid = req.body.empid;
    const dateFrom = req.body.dateFrom;
    const dateTo = req.body.dateTo;
    console.log(empid)
     console.log(dateFrom)
     console.log(dateTo)
     
     let sql;
     let values;
     console.log("empid++",empid)
     if(empid){
        sql = "SELECT * FROM attendance_reports WHERE EmpID = ?";
        values = [empid];
     }
     else if (dateTo) {
         sql = "SELECT * FROM attendance_reports WHERE EmpID = ? AND date BETWEEN ? AND ?";
         values = [empid, dateFrom, dateTo];
     } else {
         sql = "SELECT * FROM attendance_reports WHERE EmpID = ? AND date = ?";
         values = [empid, dateFrom];
     }
 
     db.query(sql, values, (err, result) => {
        try
        {
            console.log("resultData",result)
            res.send({status:"Success",message:"Attendance details",attendanceDetails:result});
            // res.send(JSON.stringify(result));
        }
        catch(err){
            // res.status(500).json({ error: 'Internal Server Error' });
            res.send({ error: 'Internal Server Error' });

            console.log("Error",err)
        }
        //  if (err) {
        //      console.log(err);
        //  } else {
        //      res.send(JSON.stringify(result));
        //  }
     });
 });



//Add attendance


router.post("/addAttendance", (req, res) => {
    res.setHeader('mysql', { "Content-Type": 'application/json' });
    const empid = req.body.empid;
    const empname = req.body.empname;
    const designation = req.body.designation;
    const dateFrom = req.body.dateFrom;
    const dateTo = req.body.dateTo;
    const mode = req.body.mode;
    const Status = "Pending";
    let sql;
    let values = [];
    console.log("empid",empid)
    insertQuery = "insert into attendance_reports(EmpID, EmpName, Designation, Date, Status, mode) values ?";
    sql = "SELECT DATEDIFF(" + dateTo + "," + dateFrom + ") AS day_difference";
    db.query("SELECT DATEDIFF(?, ?) AS day_difference", [dateTo, dateFrom], (err, result) => {
        if (err) {
            console.log(err);
            res.send({error:"Error occurred."});
            return;
        }
        const dayDifference = result[0].day_difference;
        if (dayDifference >= 0) {
            for (let i = 0; i <= dayDifference; i++) {
                // const currentDate = moment(new Date(dateFrom),'DD-MM-YYY').format();
                const currentDate = new Date(dateFrom);
                currentDate.setDate(currentDate.getDate() + i);
                if (moment(currentDate).day() !== 0) {
                   
                       values.push([empid, empname, designation, currentDate, Status, mode]);
                    
                    //values.push([empid, empname, designation, currentDate.toISOString().split('T')[0], Status, mode]);
                }
                console.log("currentDate:",currentDate);
            }

            db.query(insertQuery, [values], (err, result) => {
                if (err) {
                    console.log("Error",err);
                // res.status(500).send({ error: 'Internal Server Error' });
                    res.send({status:"Error", message: 'Internal Server Error' });
                } 
                else {
                    // res.send(JSON.stringify(result));
                    res.send({status:"Success",message: 'Add attendance successfully',resultdata:result});
                   // res.json({ message: 'Add attendance successfully', attendanceDetails:result });
                    console.log('Add attendance successfully',result)
                }
            });
        }
    })
});

//login

router.post("/login", (req, res) => {
        res.setHeader('mysql', { "Content-Type": 'application/json' });
        const username = req.body.username;
        const password = req.body.password;
        let sql = "select userdetails.EmpID, usercredential.SecretID, userdetails.First_Name, userdetails.Last_Name, usercredential.UserName, usercredential.Password, userdetails.Designation, userdetails.DOJ, DATEDIFF(CURDATE(), DOJ)/365 as Experience, userdetails.Address, userdetails.Zipcode, userdetails.Is_Active, usercredential.MobileNo from userdetails inner join usercredential on userdetails.EmpID = usercredential.EmpID where Is_Active = 1 and username =? and password =?";
        // const sql = "select UserDetails.EmpID, usercredential.SecretID, UserDetails.First_Name, UserDetails.Last_Name, usercredential.UserName, usercredential.Password, UserDetails.Designation, UserDetails.DOJ, DATEDIFF(CURDATE(), DOJ)/365 as Experience, UserDetails.Address, UserDetails.Zipcode, UserDetails.Is_Active, usercredential.MobileNo from UserDetails inner join usercredential on UserDetails.EmpID = usercredential.EmpID where Is_Active = 1 and username =? and password =?";
        db.query(sql, [username, password], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                // if (result.length === 0) {
                //     res.send("Username or password is not exists!");
                // } else {
                    // console.log("Result :",result)
                    const id = result;
                    token = jwt.sign({ id }, "jwtSecret");
                    res.cookie('token', token, { httpOnly: true, maxAge: 600000 });
                    res.send({
                        token,
                        resultData:result
                    });
                }
            // }
        });
    });

//birthdate

    router.post("/birth_date", (req, res) => {
    res.setHeader('mysql', { "Content-Type": 'application/json' });
    const sql = "SELECT * FROM  userdetails WHERE Is_Active=1 AND DATE_FORMAT( CONCAT(YEAR(CURDATE()),'-',DATE_FORMAT(DOB, '%m-%d') ), '%Y-%m-%d') BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 1 MONTH) order by DAYOFYEAR(DOB) < DAYOFYEAR(CURDATE()),DAYOFYEAR(DOB) LIMIT 2 ";
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log("birthdayData+++",result)
            res.send({status:"Success",message: 'Show Birthday details',resultdata:result});
            // res.send(JSON.stringify(result));
        }
    })
});


//search user

router.post("/search", (req, res) => {
    res.setHeader('mysql', { "Content-Type": 'application/json' });
    const username = req.body.username;
    const sql = "select userdetails.EmpID, usercredential.SecretID, userdetails.First_Name, userdetails.Last_Name, usercredential.UserName, usercredential.Password, userdetails.Designation, userdetails.DOJ, DATEDIFF(CURDATE(), DOJ)/365 as Experience, userdetails.Address, userdetails.Zipcode, userdetails.Is_Active, usercredential.MobileNo from userdetails inner join usercredential on userdetails.EmpID = usercredential.EmpID where Is_Active = 1 and UserName = ?"
    db.query(sql, username, (err, results) => {
        if (err) {
            console.log(err);
        } else {
            res.send(JSON.stringify(results));
        }
    });
})

//add and show employee
router.post("/add&show_employee", (req, res) => {
        res.setHeader('mysql', { "Content-Type": 'application/json' });
        const empid = req.body.empid;
        const firstname = req.body.firstname;
        const lastname = req.body.lastname;
        const experience = req.body.experience;
        const designation = req.body.designation;
        const dob = req.body.dob;
        const age = req.body.age;
        const doj = req.body.doj;
        const dod = req.body.dod;
        const address = req.body.address;
        const zipcode = req.body.zipcode;
        const is_active = 1;
        const username = req.body.username;
        const password = req.body.password;
        const mobileno = req.body.mobileno;
        const otp = "NULL";
        const mail = req.body.mail;
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'prsanna1109@gmail.com',
                pass: 'Jsbpb@@123'
            }
        });
        const sql = "insert into userdetails(EmpID, First_Name, Last_Name, DOB, Age, Experience, Designation, DOJ, DOD, Address, Zipcode, Is_Active) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const sql1 = "insert into usercredential(EmpID, UserName, Password, MobileNo, OTP, Mail) values(?, ?, ?, ?, ?, ?)";
        db.query(sql, [empid, firstname, lastname, dob, age, experience, designation, doj, dod, address, zipcode, is_active], (err, result) => {
            if (err) {
                console.log(err);
            }
            res.send(JSON.stringify(result));
        });
    })

// this code for firbase push notification
    // router.post("/register", (req, res) => {
    //     tokens.push(req.body.token);
    //     res.status(200).json({ message: "Successfully registered FCM Token!" });
    //   });
module.exports=router;