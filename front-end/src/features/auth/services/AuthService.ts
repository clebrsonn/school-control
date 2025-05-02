import { get, post } from '../../../config/axios';
import { IUser } from '@hyteck/shared';
import { AuthenticationRequest, AuthenticationResponse } from '../types/AuthTypes';
import { UserResponse } from '../../users/types/UserTypes';

const API_URL = "/auth";

// Legacy interface - kept for backward compatibility
interface AuthResponse{
    token: string;
    user: IUser;
}

/**
 * Authenticate user
 * @param authData Authentication request data
 * @returns Authentication response
 */
export const authenticate = async (authData: AuthenticationRequest): Promise<AuthenticationResponse> => {
    const response = await post<AuthenticationRequest, AuthenticationResponse>(`${API_URL}/login`, authData);
    localStorage.setItem('token', response.token);
    return response;
};

// Legacy method - kept for backward compatibility
export const login = async (username: string, password: string) => {
    const response = await post<unknown, AuthResponse>(`${API_URL}/login`, {login: username, password: password});
    localStorage.setItem('token', response.token);
    return response;
};

/**
 * Verify account
 * @param token Verification token
 * @returns Success message
 */
export const verifyAccount = async (token: string): Promise<string> => {
    return await get<string>(`${API_URL}/verify?token=${token}`);
};

// Legacy method - kept for backward compatibility
export const register = async (user: Partial<IUser>) => {
    const response = await post<Partial<IUser>, AuthResponse>(`users`, user);
    localStorage.setItem('token', response.token);
    return response;
};

/**
 * Logout user
 */
export const logout = async () => {
    //await get(`users/logout`);
    localStorage.removeItem('token');
};

// Legacy method - kept for backward compatibility
export const me = async () => {
    return await get<Partial<UserResponse>>(`users/me`);
}
