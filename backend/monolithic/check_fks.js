const mysql = require('mysql2/promise');
async function run() {
  const connection = await mysql.createConnection({ host: 'localhost', user: 'nguyenhoangthao', password: '123456', database: 'information_schema' });
  const [rows] = await connection.execute('SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME FROM KEY_COLUMN_USAGE WHERE REFERENCED_TABLE_SCHEMA = \'EdTech\' AND REFERENCED_TABLE_NAME IN (\'assessments\', \'questions\')');
  console.log(rows);
  process.exit(0);
}
run();
