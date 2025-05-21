import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { FaUserCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider.tsx';
import FormField from '../../../components/common/FormField';
import { extractFieldErrors } from '../../../utils/errorUtils';

function LoginPage() {
    const [username, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const {login} = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});
        setLoading(true);

        try {
            await login(username, password);
        } catch (error) {
            const errors = extractFieldErrors(error);
            setFieldErrors(errors);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="text-center mb-4">
                <FaUserCircle size={60} className="text-primary mb-3" />
                <h2>School Control</h2>
                <p className="text-muted">Entre com suas credenciais para acessar o sistema</p>
            </div>

            <Form onSubmit={handleSubmit}>
                <FormField
                    id="formBasicEmail"
                    label="Username"
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setEmail(e.target.value)}
                    error={fieldErrors.username || null}
                    required
                />

                <FormField
                    id="formBasicPassword"
                    label="Password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={fieldErrors.password || null}
                    required
                />

                <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Entrando...
                        </>
                    ) : (
                        'Login'
                    )}
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
