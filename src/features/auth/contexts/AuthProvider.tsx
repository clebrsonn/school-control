import { createContext, ReactNode, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    login as loginService,
    logout as logoutService,
    me,
    register as registerService
} from '../services/AuthService.ts';
import notification from '../../../components/common/Notification.tsx';
import { UserRequest, UserResponse } from '../../users/types/UserTypes.ts';
import { extractErrorMessage, extractFieldErrors } from '../../../utils/errorUtils.ts';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner.tsx';

interface AuthContextType {
    user: Partial<UserResponse> | null | undefined;
    login: (email: string, password: string) => Promise<void>;
    register: (userToregistry: UserRequest) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();

    const { data: user, isLoading, isError, error } = useQuery<Partial<UserResponse> | null, Error>({
        queryKey: ['currentUser'],
        queryFn: me,
        enabled: !!localStorage.getItem('token'),
        staleTime: 5 * 60 * 1000,
        retry: (failureCount, error) => {
            if ((error as any)?.response?.status === 401) {
                return false;
            }
            return failureCount < 3;
        }
    });

    if (isLoading) {
        return (
            <LoadingSpinner></LoadingSpinner>
        );
    }


    const login = async (email: string, password: string) => {
        try {
            const data = await loginService({ login: email, password });
            queryClient.setQueryData(['currentUser'], data.user);
            const from = (location.state as { from: { pathname: string } })?.from?.pathname || '/';
            navigate(from, { replace: true });
        } catch (error) {
            const fieldErrors = extractFieldErrors(error);
            if (Object.keys(fieldErrors).length > 0) {
                Object.values(fieldErrors).forEach(msg => notification(msg, 'error'));
            } else {
                notification(extractErrorMessage(error), 'error');
            }
            throw error;
        }
    };

    const register = async (userToRegistry: UserRequest) => {
        try {
            const data = await registerService(userToRegistry);
            queryClient.setQueryData(['currentUser'], data.user);
            navigate('/');
        } catch (error) {
            const fieldErrors = extractFieldErrors(error);
            if (Object.keys(fieldErrors).length > 0) {
                Object.values(fieldErrors).forEach(msg => notification(msg, 'error'));
            } else {
                notification(extractErrorMessage(error), 'error');
            }
            throw error;
        }
    };

    const logout = () => {
        logoutService();
        queryClient.removeQueries({ queryKey: ['currentUser'] });
        navigate('/login');
    };

    // Notificação de erro apenas uma vez
    if (isError && error && localStorage.getItem('token')) {
        notification(extractErrorMessage(error), 'error');
        logout();
    }


    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
