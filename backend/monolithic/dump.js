const mysql = require('mysql2/promise');
async function run() {
  const connection = await mysql.createConnection({ host: 'localhost', user: 'nguyenhoangthao', password: '123456', database: 'EdTech' });
  const [rows] = await connection.execute('SELECT q.question_id, q.type, q.content, q.assessment_id, a.type as assessment_type, COUNT(o.option_id) as options_count FROM questions q LEFT JOIN question_options o ON q.question_id = o.question_id LEFT JOIN assessments a ON q.assessment_id = a.assessment_id GROUP BY q.question_id, q.type, q.content, q.assessment_id, a.type');
  console.log(rows);
  process.exit(0);
}
run();
