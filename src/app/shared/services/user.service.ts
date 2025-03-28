import { Observable } from 'rxjs';
import { User } from '../types/user.type';
import { CreateUser } from '../types/user.type';
import { LoginUser } from '../types/user.type';

export class UserService {
  private readonly BASE_URL = 'http://localhost:3000';

  async post<T>(url: string, body?: object): Promise<T> {
    const options: RequestInit = { method: 'POST' };
    //console.log(body);
    if (body) {
      options.headers = {
        'Content-Type': 'application/json',
      };
      options.body = JSON.stringify(body);
    }

    console.log('Request URL:', url);
    console.log('Request Options:', options);

    const response = await fetch(url, options);
    if (response.ok) {
      return response.json();
    }

    throw response;
  }

  async get<T>(url: string): Promise<T> {
    const options: RequestInit = { method: 'GET' };
    const response = await fetch(url, options);
    if (response.ok) {
      return response.json();
    }

    throw response;
  }

  async createUser(user: CreateUser): Promise<User> {
    return this.post<User>(`${this.BASE_URL}/users`, user);
  }
  async loginUser(user: LoginUser): Promise<User> {
    return this.post<User>(`${this.BASE_URL}/users/auth`, user);
  }
  async getUserName(userId: string): Promise<string> {
    const userIdNum = Number(userId);
    const user = await this.get<User>(`${this.BASE_URL}/users/${userIdNum}`);
    return user.nickname;
  }
}
