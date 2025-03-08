import {post} from "../config/axios/post.ts";
import {get} from "../config/axios/get.ts";
import {IUser} from "@hyteck/shared";

const API_URL = "/auth";
interface AuthResponse{
    token: string;
    user: IUser;
}
export const login = async (username: string, password: string) => {
    const response = await post<unknown, AuthResponse>(`${API_URL}/login`, {username, password});
    localStorage.setItem('token', response.token);
    return response;
};

export const register = async (user: Partial<IUser>) => {
    const response = await post<Partial<IUser>, AuthResponse>(`${API_URL}/register`, user);
    localStorage.setItem('token', response.token);
    return response;
};

export const logout = async () => {
    await get(`users/logout`);
    localStorage.removeItem('token');
};

export const me = async () => {
    return await get<Partial<IUser>>(`users/me`);
}