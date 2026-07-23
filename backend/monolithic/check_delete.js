const mysql = require('mysql2/promise');
async function run() {
  const connection = await mysql.createConnection({ host: 'localhost', user: 'nguyenhoangthao', password: '123456', database: 'EdTech' });
  await connection.beginTransaction();
  try {
    await connection.execute('DELETE FROM lessons WHERE lesson_id = 3');
    console.log('Deleted successfully (rolling back)');
  } catch (e) {
    console.log('Failed to delete:', e.message);
  }
  await connection.rollback();
  process.exit(0);
}
run();
