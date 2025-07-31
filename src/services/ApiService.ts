class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'https://localhost:57624/api';
    this.token = localStorage.getItem('authToken');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401) {
        this.clearAuth();
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
      
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.title || errorMessage;
      } catch (parseError) {
        // If response is not JSON, try to get text
        try {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        } catch (textError) {
          console.error('Failed to parse error response:', parseError, textError);
        }
      }
      
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else {
      return response.text() as any;
    }
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearAuth(): void {
    this.token = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    return this.handleResponse(response);
  }

  async register(userData: any) {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });

    return this.handleResponse(response);
  }

  async verifyEmail(email: string, code: string, type: string) {
    const response = await fetch(`${this.baseURL}/auth/verify-email`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, code, type }),
    });

    return this.handleResponse(response);
  }

  async forgotPassword(email: string) {
    const response = await fetch(`${this.baseURL}/auth/forgot-password`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email }),
    });

    return this.handleResponse(response);
  }

  async resetPassword(email: string, verificationCode: string, newPassword: string) {
    const response = await fetch(`${this.baseURL}/auth/reset-password`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, verificationCode, newPassword }),
    });

    return this.handleResponse(response);
  }

  async virtualUserLogin(organizationName: string, userCode: string) {
    const response = await fetch(`${this.baseURL}/auth/virtual-user-login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ organizationName, userCode }),
    });

    return this.handleResponse(response);
  }

  async verifyVirtualUserOtp(email: string, code: string) {
    const response = await fetch(`${this.baseURL}/auth/verify-virtual-user-otp`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, code }),
    });

    return this.handleResponse(response);
  }

  // Dashboard endpoints
  async getDashboardMetrics(organizationId?: string) {
    const params = organizationId ? `?organizationId=${organizationId}` : '';
    const response = await fetch(`${this.baseURL}/dashboard/metrics${params}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async getGrowthData(year: number = 2024) {
    const response = await fetch(`${this.baseURL}/dashboard/growth?year=${year}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async getImprovementData() {
    const response = await fetch(`${this.baseURL}/dashboard/improvement`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async getRecentTrainees(count: number = 10) {
    const response = await fetch(`${this.baseURL}/dashboard/recent-trainees?count=${count}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  // Course endpoints
  async getCourses() {
    const response = await fetch(`${this.baseURL}/courses`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async getPublicCourses() {
    const response = await fetch(`${this.baseURL}/courses/public`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async getOrganizationCourses(organizationId: string) {
    const response = await fetch(`${this.baseURL}/courses/organization/${organizationId}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async getCourseById(id: string) {
    const response = await fetch(`${this.baseURL}/courses/${id}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async createCourse(courseData: any) {
    const response = await fetch(`${this.baseURL}/courses`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(courseData),
    });

    return this.handleResponse(response);
  }

  async updateCourse(id: string, courseData: any) {
    const response = await fetch(`${this.baseURL}/courses/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(courseData),
    });

    return this.handleResponse(response);
  }

  async deleteCourse(id: string) {
    const response = await fetch(`${this.baseURL}/courses/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async getCourseModules(courseId: string) {
    const response = await fetch(`${this.baseURL}/courses/${courseId}/modules`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async createModule(courseId: string, moduleData: any) {
    const response = await fetch(`${this.baseURL}/courses/${courseId}/modules`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(moduleData),
    });

    return this.handleResponse(response);
  }

  async updateModule(courseId: string, moduleId: string, moduleData: any) {
    const response = await fetch(`${this.baseURL}/courses/${courseId}/modules/${moduleId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(moduleData),
    });

    return this.handleResponse(response);
  }

  async deleteModule(courseId: string, moduleId: string) {
    const response = await fetch(`${this.baseURL}/courses/${courseId}/modules/${moduleId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  // Virtual User endpoints
  async getVirtualUsers(accountId?: string) {
    const params = accountId ? `?accountId=${accountId}` : '';
    const response = await fetch(`${this.baseURL}/virtualusers${params}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async getVirtualUserById(id: string) {
    const response = await fetch(`${this.baseURL}/virtualusers/${id}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async getVirtualUserByCode(organizationName: string, userCode: string) {
    try {
      const response = await fetch(`${this.baseURL}/virtualusers/organization/${encodeURIComponent(organizationName)}/code/${encodeURIComponent(userCode)}`, {
        headers: this.getHeaders(),
      });

      if (response.status === 404) {
        return null; // Virtual user not found
      }

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching virtual user by code:', error);
      return null;
    }
  }

  async createVirtualUser(userData: any) {
    const response = await fetch(`${this.baseURL}/virtualusers`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });

    return this.handleResponse(response);
  }

  async createBulkVirtualUsers(usersData: any[]) {
    const response = await fetch(`${this.baseURL}/virtualusers/bulk`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ virtualUsers: usersData }),
    });

    return this.handleResponse(response);
  }

  async updateVirtualUser(id: string, userData: any) {
    const response = await fetch(`${this.baseURL}/virtualusers/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });

    return this.handleResponse(response);
  }

  async deleteVirtualUser(id: string) {
    const response = await fetch(`${this.baseURL}/virtualusers/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  // Training endpoints
  async getTrainingData(accountId?: string) {
    const params = accountId ? `?accountId=${accountId}` : '';
    const response = await fetch(`${this.baseURL}/training/data${params}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async getTrainingSteps(trainingId: string) {
    const response = await fetch(`${this.baseURL}/training/steps/${trainingId}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async getGraduatedUsers(accountId?: string) {
    const params = accountId ? `?accountId=${accountId}` : '';
    const response = await fetch(`${this.baseURL}/training/graduated${params}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async createGraduatedUser(virtualUserId: string, courseId: string) {
    const response = await fetch(`${this.baseURL}/training/graduated`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ virtualUserId, courseId }),
    });

    return this.handleResponse(response);
  }

  // Account endpoints (Admin only)
  async getAccounts() {
    const response = await fetch(`${this.baseURL}/accounts`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async getAccountById(id: string) {
    const response = await fetch(`${this.baseURL}/accounts/${id}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }
  async updateAccount(id: string, accountData: any) {
    const response = await fetch(`${this.baseURL}/accounts/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(accountData),
    });

    return this.handleResponse(response);
  }

  async deleteAccount(id: string) {
    const response = await fetch(`${this.baseURL}/accounts/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  // Device endpoints
  async getDevices(accountId?: string) {
    const params = accountId ? `?accountId=${accountId}` : '';
    const response = await fetch(`${this.baseURL}/devices${params}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async updateDevice(id: string, deviceData: any) {
    const response = await fetch(`${this.baseURL}/devices/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(deviceData),
    });

    return this.handleResponse(response);
  }

  async deleteDevice(id: string) {
    const response = await fetch(`${this.baseURL}/devices/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  // Alert endpoints
  async getAlerts(accountId?: string) {
    const params = accountId ? `?accountId=${accountId}` : '';
    const response = await fetch(`${this.baseURL}/alerts${params}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async createAlert(alertData: any) {
    const response = await fetch(`${this.baseURL}/alerts`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(alertData),
    });

    return this.handleResponse(response);
  }

  async markAlertAsRead(alertId: string) {
    const response = await fetch(`${this.baseURL}/alerts/${alertId}/mark-read`, {
      method: 'PUT',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async deleteAlert(alertId: string) {
    const response = await fetch(`${this.baseURL}/alerts/${alertId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async deleteAllAlerts() {
    const response = await fetch(`${this.baseURL}/alerts/all`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async getUnreadAlertCount(accountId?: string) {
    const params = accountId ? `?accountId=${accountId}` : '';
    const response = await fetch(`${this.baseURL}/alerts/unread-count${params}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }
// Enrollment endpoints
  async getAllEnrollments() {
    const response = await fetch(`${this.baseURL}/enrollments`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async getEnrollmentsByAccount(accountId: string) {
    const response = await fetch(`${this.baseURL}/enrollments/account/${accountId}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async getMyEnrollments() {
    const response = await fetch(`${this.baseURL}/enrollments/my-enrollments`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async getEnrollmentById(id: string) {
    const response = await fetch(`${this.baseURL}/enrollments/${id}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async createEnrollment(enrollmentData: any) {
    const response = await fetch(`${this.baseURL}/enrollments`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(enrollmentData),
    });

    return this.handleResponse(response);
  }

  async updateEnrollment(id: string, enrollmentData: any) {
    const response = await fetch(`${this.baseURL}/enrollments/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(enrollmentData),
    });

    return this.handleResponse(response);
  }

  async deleteEnrollment(id: string) {
    const response = await fetch(`${this.baseURL}/enrollments/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }
}


export default new ApiService();