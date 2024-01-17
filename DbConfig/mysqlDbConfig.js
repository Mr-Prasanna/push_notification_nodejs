const mysql=require('mysql2');
const connection=mysql.createConnection({
  //dialect:'mysql',
  host:'localhost',
  port:'3306',
  user:'root',
  password:'root@123',
  database:'attendance_maintenance'
})

connection.connect((error) => {
  if (error) {
    console.error('Error connecting to MySQL database:', error);
  } else {
    console.log('Connected to MySQL database!');
  }
});

module.exports=connection;