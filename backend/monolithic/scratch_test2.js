const jwt = require('jsonwebtoken');

const secret = 'supersecretkey';
const payload = {
  userId: 4,
  email: 'Learner@system.com',
  roleId: 4,
  roleName: 'learner'
};

const token = jwt.sign(payload, secret, { expiresIn: '1h' });

fetch('http://localhost:5002/api/challenge_request/online', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => {
  console.log('Online players response:', data.length);
})
.catch(err => {
  console.error('Error:', err);
});
