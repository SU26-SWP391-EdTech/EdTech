const mysql = require('mysql2/promise');

async function test() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'nguyenhoangthao',
            password: '123456',
            database: 'EdTech',
            port: 3306
        });
        
        const [users] = await connection.execute(`
            SELECT u.user_id, u.full_name, u.email, r.role_name 
            FROM users u 
            LEFT JOIN roles r ON u.role_id = r.role_id
        `);
        console.log('USERS:', JSON.stringify(users, null, 2));
        await connection.end();
    } catch (err) {
        console.error('ERROR:', err.message);
    }
}

test();
