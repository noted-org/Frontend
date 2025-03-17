export interface User{
    nickname: string;
    password: string;
    username: string;
    id?: number;
    createdAt?: string;
    updatedAt?: string;
    email: string;
}

export type CreateUser = Pick<User, "nickname" | "password" | "username" | "email">;
export type LoginUser = Pick<User, 'username' | 'password'>