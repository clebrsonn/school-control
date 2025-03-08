import {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {
    login as loginService,
    logout as logoutService,
    me,
    register as registerService
} from "../../services/AuthService";
import {IUser} from "@hyteck/shared";
import notification from "../../components/Notification.tsx";

interface AuthContextType {
    user: Partial<IUser> | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<Partial<IUser> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const user = await me();
                    setUser(user);
                } catch (error: unknown) {
                    notification(error as string, 'error')
                    logout();
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
        const data = await loginService(email, password);
        setUser(data.user);
    };

    const register = async (email: string, password: string) => {
        const data = await registerService({ email, passwordHash: password } as Partial<IUser>);
        setUser(data.user);
    };

    const logout = () => {
        logoutService();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
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
