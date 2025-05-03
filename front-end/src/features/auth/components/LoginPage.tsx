import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { FaUserCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider.tsx';


function LoginPage() {
    const [username, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const {login} = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        await login(username, password);
    };

    return (
        <div>
            <div className="text-center mb-4">
                <FaUserCircle size={60} className="text-primary mb-3" />
                <h2>School Control</h2>
                <p className="text-muted">Entre com suas credenciais para acessar o sistema</p>
            </div>

            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                    Login
                </Button>

                <div className="text-center mt-3">
                    <p className="mb-1"><a href="#" className="text-decoration-none">Esqueceu sua senha?</a></p>
                    <p className="mb-0">Não tem uma conta? <Link to="/register" className="text-decoration-none">Registre-se</Link></p>
                </div>
            </Form>
        </div>
    );
}

export default LoginPage;
