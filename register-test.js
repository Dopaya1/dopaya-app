// Register test
const registerData = {
  username: "testuser2",
  email: "test2@example.com",
  password: "password123",
  firstName: "Test",
  lastName: "User"
};

fetch('http://localhost:5000/api/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(registerData),
  credentials: 'include'
})
.then(response => response.json())
.then(data => console.log('Registration successful:', data))
.catch(error => console.error('Registration failed:', error));