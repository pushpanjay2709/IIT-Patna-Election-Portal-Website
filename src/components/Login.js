import React, { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios'
import { useNavigate } from 'react-router-dom';

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    async function handleSubmit(event) {
        event.preventDefault();
        try {
            
            localStorage.setItem('userEmail', email);
            await axios.post('http://localhost:8085/login', { email })
            .then(res => {
                localStorage.setItem('flag', res.data.message);
              })
              .catch(err =>
                console.log('Error fetching image:', err));
            navigate('/Homepage');
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div className='d-flex vh-100 justify-content-center align-items-center bg-primary'>
            <div className='p-3   bg-white w-25'>
                <form onSubmit={handleSubmit}>
                    <div className='mb-3'>
                        <label htmlFor='email'>Email</label>
                        <input type='email' placeholder='Enter Email' className='form-control'
                            onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div className='mb-3'>
                        <label htmlFor='password'>Password</label>
                        <input type='password' placeholder='Enter Password' className='form-control'
                            onChange={e => setPassword(e.target.value)} />
                    </div>
                    <button className='btn btn-success'>Login</button>
                </form>
            </div>
        </div>
    )
}

export default Login