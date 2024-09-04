import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = (props) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const submitData = async (e) => {
        e.preventDefault();
    
        try {
            const response = await axios.post('http://localhost:2000/api/login', 
                { email, password },
                { headers: { 'Content-Type': 'application/json' } }
            );
    
            if (response.data.message === 'success' && response.data.accessToken && response.data.refreshToken) {
                setMessage("Login successful!");
    
                // Save tokens to local storage
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('refreshToken', response.data.refreshToken);
    
                props.setName(response.data.name || '');
                navigate('/'); // Navigate to home page
            } else {
                setMessage("An unexpected error occurred.");
            }
        } catch (error) {
            console.error('Error during login:', error);
            setMessage("Error occurred while logging in. Please try again.");
        }
    };

    return (
        <div>
            <form onSubmit={submitData}>
                <h1 className="h3 mb-3 fw-normal">Please sign in</h1>

                <div className="form-floating">
                    <input 
                        type="email" 
                        className="form-control" 
                        placeholder="name@example.com" 
                        onChange={(e) => setEmail(e.target.value)} 
                        value={email}
                    />
                    <label htmlFor="floatingInput">Email address</label>
                </div>
                <div className="form-floating">
                    <input 
                        type="password" 
                        className="form-control" 
                        placeholder="Password" 
                        onChange={(e) => setPassword(e.target.value)} 
                        value={password}
                    />
                    <label htmlFor="floatingPassword">Password</label>
                </div>
                <button className="btn btn-primary w-100 py-2" type="submit">Sign in</button>
                {message && <p className="mt-3 text-danger">{message}</p>}
                <p className="mt-5 mb-3 text-body-secondary">© 2017–2024</p>
            </form>
        </div>
    );
}

export default Login;