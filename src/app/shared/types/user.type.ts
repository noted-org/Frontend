export interface User{
    name: string;
    password: string;
    username: string;
    _id?: string;
}

export type CreateUser = Pick<User, "name" | "password" | "username">;