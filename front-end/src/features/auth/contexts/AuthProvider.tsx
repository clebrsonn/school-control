import { createContext, ReactNode, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    login as loginService,
    logout as logoutService,
    me,
    register as registerService
} from '../services/AuthService.ts';
import { IUser } from '@hyteck/shared';
import notification from '../../../components/common/Notification.tsx';

interface AuthContextType {
    user: Partial<IUser> | null | undefined; // Updated to include undefined for initial state
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({children}: { children: ReactNode }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();

    const { data: user, isLoading, isError, error } = useQuery<Partial<IUser> | null, Error>({
        queryKey: ['currentUser'],
        queryFn: me,
        enabled: !!localStorage.getItem("token"),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount, error) => {
            // Prevent retry for 401 errors, as it means the token is invalid
            if ((error as any)?.response?.status === 401) {
                return false;
            }
            return failureCount < 3; // Default retry count
        }
    });

    if (isError && error) {
        notification(error.message || 'Session expired or invalid. Please log in again.', 'error');
        // Call logout directly which handles service call and cache clearing
        // This avoids being in a render loop if logout itself causes a re-render that hits this again
        // Ensure logout is idempotent or handles being called multiple times if necessary
        logoutService(); // Perform the actual logout operation (e.g., clear token)
        queryClient.removeQueries({ queryKey: ['currentUser'] }); // Clear user data from cache
        // No navigation here as it might be handled by protected routes or other logic
    }

    const login = async (email: string, password: string) => {
        const data = await loginService(email, password);
        queryClient.setQueryData(['currentUser'], data.user);
        const from = (location.state as { from: { pathname: string } })?.from?.pathname || "/";
        navigate(from, {replace: true});
    };

    const register = async (email: string, password: string) => {
        const data = await registerService({email, passwordHash: password} as Partial<IUser>);
        queryClient.setQueryData(['currentUser'], data.user);
        // Typically, after registration, you might want to navigate to login or a dashboard
        // For now, just setting user data.
    };

    const logout = () => {
        logoutService();
        queryClient.removeQueries({ queryKey: ['currentUser'] });
        // queryClient.clear(); // Optionally clear the entire cache
        navigate('/auth/login'); // Redirect to login after logout
    };

    return (
        <AuthContext.Provider value={{user, login, register, logout}}>
            {!isLoading && children}
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