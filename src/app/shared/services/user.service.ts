import { from, map, Observable } from 'rxjs';
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

  async get<T>(url: string, headers?: { [key: string]: string }): Promise<T> {
    const options: RequestInit = {
      method: 'GET',
    };

    if (headers) {
      options.headers = headers;
    }

    console.log('Request URL:', url);
    console.log('Request Options:', options);

    const response = await fetch(url, options);

    if (response.ok) {
      return response.json();
    }

    throw response;
  }

  async createUser(user: CreateUser): Promise<User> {
    return this.post<User>(`${this.BASE_URL}/users`, user);
  }

  getUserName(userId: string): Observable<string> {
    const userIdNum = Number(userId);
    return from(this.get<User>(`${this.BASE_URL}/users/${userIdNum}`)).pipe(
      map((user) => user.nickname)
    );
  }

  async loginUser(user: LoginUser): Promise<User> {
    const uname = user.username;
    const upass = user.password;
    const headers = {
      Authorization: `Bearer ${uname} ${upass}`,
      'Content-Type': 'application/json',
    };
    return this.get<User>(`${this.BASE_URL}/users/auth`, headers);
  }
  async getUser(userId: number): Promise<User> {
    try {
      const response = await fetch(`${this.BASE_URL}/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Problem searching User: ${response.statusText}`);
      }
      const user: User = await response.json();
      return user;
    } catch (error) {
      console.error('Problem with getting user: ', error);
      throw error;
    }
  }

  async getProfilePicture(userId: number): Promise<string> {
    try {
      const response = await fetch(`${this.BASE_URL}/users/${userId}/profile-picture`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Problem getting profile picture: ${response.statusText}`);
      }
      const image: string = await response.text();
      return image;
    } catch (error) {
      console.error('Problem with getting profile picture: ', error);
      throw error;
    }
  }

  async updateUser(
    userId: string,
    nickname: string,
    username: string,
    email: string,
    profilePicture?: string
  ): Promise<User | void> {
    const userIdAsNumber = parseInt(userId, 10);
    const password = localStorage.getItem('pw');
    try {
      const body = {
        nickname: nickname || undefined,
        username: username || undefined,
        email: email || undefined,
        profilePicture: profilePicture || undefined,
      };

      const response = await fetch(`${this.BASE_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userId} ${password}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Problem updating user: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Problem with updating user: ', error);
    }
  }

  userLoggedIn(): boolean{
    return !!localStorage.getItem('id');
  }
}
