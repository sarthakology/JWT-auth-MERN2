import React, { useEffect, useState } from 'react';
import './App.css';
import Login from './pages/Login';
import Nav from './components/Nav';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import axios from 'axios';

function App() {
  const [name, setName] = useState(''); // State to store the user's name

  // useEffect hook to fetch user details on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        let accessToken = localStorage.getItem('accessToken'); // Retrieve access token from localStorage
        const refreshToken = localStorage.getItem('refreshToken'); // Retrieve refresh token from localStorage

        if (accessToken) {
          try {
            // Try fetching user data using the access token
            const response = await axios.get('http://localhost:2000/api/user', {
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}` // Send access token in Authorization header
              },
            });
            setName(response.data.name); // Set the user's name if request is successful
          } catch (error) {
            if (error.response && error.response.status === 401 && refreshToken) {
              // If access token has expired, use the refresh token to get a new access token
              const refreshResponse = await axios.post('http://localhost:2000/api/token', {
                token: refreshToken
              });

              // Update access token in localStorage with the new one
              accessToken = refreshResponse.data.accessToken;
              localStorage.setItem('accessToken', accessToken);

              // Retry fetching user data with the new access token
              const retryResponse = await axios.get('http://localhost:2000/api/user', {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${accessToken}` // Use new access token
                },
              });
              setName(retryResponse.data.name); // Set the user's name after retrying
            } else {
              console.error('Error fetching user data:', error); // Handle other errors
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error); // Log any errors during the process
      }
    };

    // Call the fetchUser function when the component mounts
    fetchUser();
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  return (
    <div className="App">
      <Router>
        <Nav name={name} setName={setName} /> {/* Pass the user's name to the Nav component */}
        <main className="form-signin w-100 m-auto">
          <Routes>
            <Route path="/" element={<Home name={name} />} /> {/* Home page route */}
            <Route path="/login" element={<Login setName={setName} />} /> {/* Login page route */}
            <Route path="/register" element={<Register />} /> {/* Register page route */}
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;
