const express = require('express');
const moment = require('moment');

const db=require('../DbConfig/mysqlDbConfig');
const router = express.Router();

router.get("/test" ,(req,res)=>{
    res.send("Its Working....");
});

//show attendance

router.post("/showAttendance", (req, res) => {//get
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



module.exports=router;