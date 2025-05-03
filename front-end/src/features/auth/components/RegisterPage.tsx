import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { FaUserPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider.tsx';

function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const {register} = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await register(email, password);
    };

    return (
        <div>
            <div className="text-center mb-4">
                <FaUserPlus size={60} className="text-primary mb-3" />
                <h2>Criar Conta</h2>
                <p className="text-muted">Preencha os dados abaixo para criar sua conta</p>
            </div>

            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Digite seu email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Senha</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Digite sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                    Registrar
                </Button>

                <div className="text-center mt-3">
                    <p className="mb-0">Já possui uma conta? <Link to="/login" className="text-decoration-none">Faça login</Link></p>
                </div>
            </Form>
        </div>
    );
}

export default RegisterPage;
