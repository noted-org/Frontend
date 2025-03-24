import { User } from "../types/user.type";
import { CreateUser } from "../types/user.type";
import { LoginUser } from "../types/user.type";

export class UserService{
    private readonly BASE_URL = 'http://localhost:3000';

    async post<T>(url: string, body?: object): Promise<T> {
        const options: RequestInit = {method: 'POST'};
        //console.log(body);
        if (body) {
          options.headers = {
            'Content-Type': 'application/json',
          };
          options.body = JSON.stringify(body);
        }
    
        console.log("Request URL:", url);
        console.log("Request Options:", options);
    
        const response = await fetch(url, options);
        if (response.ok) {
          return response.json();
        }
    
        throw response;
    }

    async createUser(user: CreateUser): Promise<User>{
        return this.post<User>(`${this.BASE_URL}/users`, user);
    }
    async loginUser(user: LoginUser): Promise<User> {
        return this.post<User>(`${this.BASE_URL}/users/auth`, user);  
      }
    async getUser(userId: number): Promise<User>{
      try{
        const response = await fetch(`${this.BASE_URL}/users/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type':'application/json',
          },
        });
        if (!response.ok) {
          throw new Error(`Problem searching User: ${response.statusText}`);
        }
        const user: User = await response.json();
        return user;
      }catch(error){
        console.error('Problem with getting user: ', error);
        throw error;
      }
    }
    async updateUser(userId: string, nickname: string, username: string, email: string): Promise<User | void> {
      const userIdAsNumber = parseInt(userId, 10);
      try {
        const body = {
          id: userIdAsNumber,
          nickname: nickname ? nickname : undefined,
          username: username ? username : undefined,
          email: email ? email : undefined,
        };
  
        const requestBody = JSON.parse(JSON.stringify(body));
  
        const response = await fetch(`${this.BASE_URL}/users/${userId}`, {
          method: 'PATCH',  
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
  
        if (!response.ok) {
          throw new Error(`Problem updating user: ${response.statusText}`);
        }
  
        const updatedUser: User = await response.json();
        return updatedUser;
  
      } catch (error) {
        console.error('Problem with updating user: ', error);
      }
    }
}