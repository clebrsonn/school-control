import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { FaUserCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { useAuth } from '../contexts/AuthProvider.tsx';
import FormField from '../../../components/common/FormField';
import { extractFieldErrors } from '../../../utils/errorUtils';

/**
 * LoginPage component provides the UI for user authentication.
 * It includes fields for username and password, a submit button,
 * and links for password recovery and registration.
 * 
 * @returns {React.ReactElement} The LoginPage component.
 */
function LoginPage() {
    const { t } = useTranslation(); // Initialize useTranslation
    const [username, setUsername] = useState(''); // Renamed setEmail to setUsername for clarity
    const [password, setPassword] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    /**
     * Handles the form submission for logging in.
     * It prevents the default form submission, sets loading state,
     * attempts to log in, and handles any errors by setting field errors.
     * @param {React.FormEvent} e - The form submission event.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});
        setLoading(true);

        try {
            await login(username, password);
            // On successful login, AuthProvider should redirect.
        } catch (error) {
            const errors = extractFieldErrors(error);
            setFieldErrors(errors);
            // Optionally, show a generic notification for login failure if no field errors are specific
            // if (Object.keys(errors).length === 0) {
            //   notification(t('auth.loginPage.notifications.loginFailed'), 'error');
            // }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="text-center mb-4">
                <FaUserCircle size={60} className="text-primary mb-3" />
                <h2>{t('auth.loginPage.title')}</h2>
                <p className="text-muted">{t('auth.loginPage.subtitle')}</p>
            </div>

            <Form onSubmit={handleSubmit}>
                <FormField
                    id="formBasicUsername" // Changed id to reflect username
                    name="username" // Added name attribute
                    label={t('auth.loginPage.labels.username')}
                    type="text"
                    placeholder={t('auth.loginPage.placeholders.username')}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)} // Use setUsername
                    error={fieldErrors.username || fieldErrors.detail || null} // Check for general 'detail' error too
                    required
                />

                <FormField
                    id="formBasicPassword"
                    name="password" // Added name attribute
                    label={t('auth.loginPage.labels.password')}
                    type="password"
                    placeholder={t('auth.loginPage.placeholders.password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={fieldErrors.password || null}
                    required
                />

                <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            {t('auth.loginPage.buttons.loggingIn')}
                        </>
                    ) : (
                        t('auth.loginPage.buttons.login')
                    )}
                </Button>

                <div className="text-center mt-3">
                    {/* TODO: Implement password recovery feature */}
                    <p className="mb-1"><a href="#" className="text-decoration-none">{t('auth.loginPage.links.forgotPassword')}</a></p>
                    <p className="mb-0">{t('auth.loginPage.links.noAccount')} <Link to="/register" className="text-decoration-none">{t('auth.loginPage.links.register')}</Link></p>
                </div>
            </Form>
        </div>
    );
}

export default LoginPage;
