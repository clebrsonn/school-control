import { get, post } from '../../../config/axios';
import { AuthenticationRequest, AuthenticationResponse } from '../types/AuthTypes';
import { UserRequest, UserResponse } from '../../users/types/UserTypes';

const API_URL = "/auth";

interface AuthResponse{
    token: string;
    user: UserResponse;
}

/**
 * Authenticate user
 * @param authData Authentication request data
 * @returns Authentication response
 */
export const login = async (authData: AuthenticationRequest): Promise<AuthenticationResponse> => {
    const response = await post<AuthenticationRequest, AuthenticationResponse>(`${API_URL}/login`, authData);
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

export const register = async (user: Partial<UserRequest>) => {
    const response = await post<Partial<UserRequest>, AuthResponse>(`users`, user);
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

export const me = async () => {
    return await get<Partial<UserResponse>>(`users/me`);
}
