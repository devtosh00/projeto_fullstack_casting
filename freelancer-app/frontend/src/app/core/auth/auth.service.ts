import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface UserInfo {
  id: number;
  username: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/Auth`;
  private currentUserSubject = new BehaviorSubject<UserInfo | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isBrowser: boolean;
  
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.initializeUserFromStoredToken();
  }

  private initializeUserFromStoredToken(): void {
    const token = this.getToken();
    if (token) {
      this.loadUserFromToken(token);
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(tap(response => this.handleAuthentication(response.token)));
  }

  register(userInfo: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userInfo)
      .pipe(tap(response => this.handleAuthentication(response.token)));
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('access_token');
    }
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const decodedToken: any = jwtDecode(token);
      const expirationDate = new Date(decodedToken.exp * 1000);
      return expirationDate > new Date();
    } catch (error) {
      return false;
    }
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('access_token');
  }

  private handleAuthentication(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem('access_token', token);
    }
    this.loadUserFromToken(token);
  }

  private loadUserFromToken(token: string): void {
    try {
      const decodedToken: any = jwtDecode(token);
      
      const user: UserInfo = {
        id: Number(decodedToken.nameid),
        username: decodedToken.unique_name
      };
      
      this.currentUserSubject.next(user);
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      this.logout();
    }
  }
} 