const db=require('../DbConfig/mysqlDbConfig');
module.exports.addAttendance = async (empid, empname, designation, dateFrom, dateTo, mode, Status) => {
    return new Promise((resolve, reject) => {
        let values = [];
        const insertQuery = "insert into attendance_reports(EmpID, EmpName, Designation, Date, Status, mode) values ?";
        const sql = "SELECT DATEDIFF(?, ?) AS day_difference";
        db.query(sql, [dateTo, dateFrom], (err, result) => {
            if (err) {
                reject("Error occurred.");
            }
            const dayDifference = result[0].day_difference;
            if (dayDifference >= 0) {
                for (let i = 0; i <= dayDifference; i++) {
                    const currentDate = new Date(dateFrom);
                    currentDate.setDate(currentDate.getDate() + i);
                    if (moment(currentDate).day() !== 0) {
                        values.push([empid, empname, designation, currentDate.toISOString().split('T')[0], Status, mode]);
                    }
                }
            }
            db.query(insertQuery, [values], (err, result) => {
                if (err) {
                    console.log(err);
                    reject("Internal Server Error");
                } else if (result.length === 0) {
                    reject("Invalid attendance");
                } else {
                    resolve({ result });
                }
            });
        })
    });
};