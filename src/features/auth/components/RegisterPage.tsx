import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { FaUserPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { useAuth } from '../contexts/AuthProvider.tsx';
import FormField from '../../../components/common/FormField';
import { extractFieldErrors } from '../../../utils/errorUtils';
// import notification from '../../../components/common/Notification.tsx'; // Optional: if you want to show success notification

/**
 * RegisterPage component provides the UI for new user registration.
 * It includes fields for username, email, and password, a submit button,
 * and a link to the login page for existing users.
 * 
 * @returns {React.ReactElement} The RegisterPage component.
 */
function RegisterPage() {
    const { t } = useTranslation(); // Initialize useTranslation
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();

    /**
     * Handles the form submission for user registration.
     * It prevents the default form submission, sets loading state,
     * attempts to register the user, and handles any errors by setting field errors.
     * @param {React.FormEvent} e - The form submission event.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});
        setLoading(true);

        try {
            await register({ username, email, password });
            // On successful registration, AuthProvider might redirect or you can show a notification
            // notification(t('auth.registerPage.notifications.registerSuccess'), 'success');
            // Consider redirecting to login or a confirmation page
        } catch (error) {
            const errors = extractFieldErrors(error);
            setFieldErrors(errors);
            // Optionally, show a generic notification for registration failure
            // if (Object.keys(errors).length === 0) {
            //    notification(t('auth.registerPage.notifications.registerFailed'), 'error');
            // }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="text-center mb-4">
                <FaUserPlus size={60} className="text-primary mb-3" />
                <h2>{t('auth.registerPage.title')}</h2>
                <p className="text-muted">{t('auth.registerPage.subtitle')}</p>
            </div>

            <Form onSubmit={handleSubmit}>
                <FormField
                    id="formBasicUsername"
                    name="username" // Added name attribute
                    label={t('auth.registerPage.labels.username')}
                    type="text"
                    placeholder={t('auth.registerPage.placeholders.username')}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    error={fieldErrors.username || null}
                    required
                />
                <FormField
                    id="formBasicEmail"
                    name="email" // Added name attribute
                    label={t('auth.registerPage.labels.email')}
                    type="email"
                    placeholder={t('auth.registerPage.placeholders.email')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={fieldErrors.email || fieldErrors.detail || null} // Check for general 'detail' error too
                    required
                />

                <FormField
                    id="formBasicPassword"
                    name="password" // Added name attribute
                    label={t('auth.registerPage.labels.password')}
                    type="password"
                    placeholder={t('auth.registerPage.placeholders.password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={fieldErrors.password || null}
                    required
                />

                <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            {t('auth.registerPage.buttons.registering')}
                        </>
                    ) : (
                        t('auth.registerPage.buttons.register')
                    )}
                </Button>

                <div className="text-center mt-3">
                    <p className="mb-0">{t('auth.registerPage.links.hasAccount')} <Link to="/login" className="text-decoration-none">{t('auth.registerPage.links.login')}</Link></p>
                </div>
            </Form>
        </div>
    );
}

export default RegisterPage;
