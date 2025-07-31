import ApiService from './ApiService';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationName: string;
  role: string;
}

class AuthService {
  private currentUser: User | null = null;

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }
  }

  private saveUserToStorage(user: User): void {
    this.currentUser = user;
    localStorage.setItem('user', JSON.stringify(user));
  }

  async login(email: string, password: string): Promise<{ success: boolean; requiresTwoFactor?: boolean; message?: string; user?: User }> {
    try {
      if (!email || !password) {
        return { success: false, message: 'Email and password are required' };
      }

      const response = await ApiService.login(email, password);
      
      if (response.success) {
        if (response.requiresTwoFactor) {
          return { success: true, requiresTwoFactor: true, message: response.message };
        }
        
        if (response.token && response.user) {
          ApiService.setToken(response.token);
          this.saveUserToStorage(response.user);
          return { success: true, user: response.user };
        }
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Login failed' };
    }
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    password: string;
    confirmPassword: string;
    accountName: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await ApiService.register(userData);
      return { success: response.success, message: response.message };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Registration failed' };
    }
  }

  async verifyEmail(email: string, code: string, type: string): Promise<{ success: boolean; message: string }> {
    try {
      await ApiService.verifyEmail(email, code, type);
      return { success: true, message: 'Email verified successfully' };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Verification failed' };
    }
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      await ApiService.forgotPassword(email);
      return { success: true, message: 'Password reset code sent to your email' };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Failed to send reset code' };
    }
  }

  async resetPassword(email: string, verificationCode: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      await ApiService.resetPassword(email, verificationCode, newPassword);
      return { success: true, message: 'Password reset successfully' };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Password reset failed' };
    }
  }

  async virtualUserLogin(organizationName: string, userCode: string): Promise<{ success: boolean; requiresTwoFactor?: boolean; message?: string; virtualUserEmail?: string }> {
    try {
      const response = await ApiService.virtualUserLogin(organizationName, userCode);
      return {
        success: response.success,
        requiresTwoFactor: response.requiresTwoFactor,
        message: response.message,
        virtualUserEmail: response.virtualUserEmail
      };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Virtual user login failed' };
    }
  }

  async verifyVirtualUserOtp(email: string, code: string): Promise<{ success: boolean; message: string }> {
    try {
      await ApiService.verifyVirtualUserOtp(email, code);
      return { success: true, message: 'Virtual user verified successfully' };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'OTP verification failed' };
    }
  }

  logout(): void {
    ApiService.clearAuth();
    this.currentUser = null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null && localStorage.getItem('authToken') !== null;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'Admin';
  }

  getUserRole(): string {
    return this.currentUser?.role || 'User';
  }

  getOrganizationName(): string {
    return this.currentUser?.organizationName || '';
  }

  getUserId(): string {
    return this.currentUser?.id || '';
  }
}

export default new AuthService();