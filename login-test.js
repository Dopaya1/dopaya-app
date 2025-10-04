// Login test
const loginData = {
  username: "testuser2",
  password: "password123"
};

fetch('http://localhost:5000/api/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(loginData),
  credentials: 'include'
})
.then(response => response.json())
.then(data => {
  console.log('Login successful:', data);
  
  // Now get the user data
  return fetch('http://localhost:5000/api/user', {
    method: 'GET',
    credentials: 'include'
  });
})
.then(response => {
  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
})
.then(userData => {
  console.log('User data:', userData);
})
.catch(error => console.error('Error:', error));