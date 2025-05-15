import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    login as loginService,
    logout as logoutService,
    me,
    register as registerService
} from '../services/AuthService.ts';
import notification from '../../../components/common/Notification.tsx';
import { UserRequest } from '../../users/types/UserTypes.ts';

interface AuthContextType {
    user: Partial<UserRequest> | null;
    login: (email: string, password: string) => Promise<void>;
    register: (userToregistry: UserRequest) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({children}: { children: ReactNode }) => {
    const [user, setUser] = useState<Partial<UserRequest> | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const user = await me();
                    setUser(user);
                } catch (error: unknown) {
                    notification(error as string, 'error')
                    //logout();
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        checkUser();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const data = await loginService(email, password);
            setUser(data.user);
            const from = (location.state)?.from?.pathname || "/";
            navigate(from, {replace: true});
            notification('Login successful', 'success');
        } catch (error) {
            notification('Login failed', 'error');
            throw error; // Re-throw the error so it can be caught by the component
        }
    };

    const register = async (userToRegistry: UserRequest) => {
        try {
            const data = await registerService(userToRegistry);
            setUser(data.user);
            notification('Registration successful', 'success');
            navigate('/');
        } catch (error) {
            notification('Registration failed', 'error');
            throw error; // Re-throw the error so it can be caught by the component
        }
    };

    const logout = () => {
        logoutService();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{user, login, register, logout}}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
