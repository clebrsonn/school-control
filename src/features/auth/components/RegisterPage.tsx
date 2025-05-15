import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { FaUserPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider.tsx';
import FormField from '../../../components/common/FormField';
import { extractFieldErrors } from '../../../utils/errorUtils';

function RegisterPage() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const {register} = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        try {
            await register({ username, email, password });
        } catch (error) {
            const errors = extractFieldErrors(error);
            setFieldErrors(errors);
        }
    };

    return (
        <div>
            <div className="text-center mb-4">
                <FaUserPlus size={60} className="text-primary mb-3" />
                <h2>Criar Conta</h2>
                <p className="text-muted">Preencha os dados abaixo para criar sua conta</p>
            </div>

            <Form onSubmit={handleSubmit}>
                <FormField
                    id="formBasicUsername"
                    label="Username"
                    type="text"
                    placeholder="Digite seu nome de usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    error={fieldErrors.username || null}
                    required
                />
                <FormField
                    id="formBasicEmail"
                    label="Email"
                    type="email"
                    placeholder="Digite seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={fieldErrors.email || null}
                    required
                />

                <FormField
                    id="formBasicPassword"
                    label="Senha"
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={fieldErrors.password || null}
                    required
                />

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
