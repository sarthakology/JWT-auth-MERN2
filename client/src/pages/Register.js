import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const submit = (e) => {
        e.preventDefault();
        const formData = {
            name: name,
            email: email,
            password: password
        };
        axios.post('http://localhost:2000/api/register', formData)
            .then(response => {
                console.log('Data sent successfully');
                navigate('/login');
                // Do something with the response if needed
            })
            .catch(error => {
                console.error('Error sending data:', error);
            });
    }

    return (
        <div>
            <form onSubmit={submit}>
                <h1 className="h3 mb-3 fw-normal">Please register</h1>

                <div className="form-floating">
                    <input 
                        className="form-control" 
                        placeholder="name" 
                        onChange={(e) => setName(e.target.value)} 
                        value={name}
                    />
                    <label htmlFor="floatingInput">Name</label>
                </div>
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
                <button className="btn btn-primary w-100 py-2" type="submit">Submit</button>
                <p className="mt-5 mb-3 text-body-secondary">© 2017–2024</p>
            </form>
        </div>
    );
}

export default Register;
