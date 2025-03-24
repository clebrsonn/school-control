import { useState } from 'react';
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
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                />
                <button type="submit">Register</button>
            </form>
        </div>
    );
}

export default RegisterPage;