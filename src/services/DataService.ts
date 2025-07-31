import { MockupData } from '../data/MockupData';

class DataService {
  private static instance: DataService;
  private courses: any[] = [];
  private modules: { [courseId: string]: any[] } = {};
  private accounts: any[] = [];
  private devices: any[] = [];
  private trainingData: any[] = [];
  private graduatedUsers: any[] = [];
  private virtualUsers: any[] = [];
  private enrollments: any[] = [];
  private alerts: { [accountId: string]: any[] } = {};
  private trainingSteps: { [trainingId: string]: any } = {};
  private currentAccountId: string = '550e8400-e29b-41d4-a716-446655440001'; // TechCorp Industries

  private constructor() {
    this.initializeSeedData();
  }

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  private initializeSeedData() {
    // Initialize with mockup data
    this.courses = MockupData.getCourses();
    this.modules = MockupData.getCourseModules();
    this.accounts = MockupData.getAccounts();
    this.devices = MockupData.getDevices();
    this.trainingData = MockupData.getTrainingData();
    this.graduatedUsers = MockupData.getGraduatedUsers();
    this.virtualUsers = MockupData.getVirtualUsers();
    this.enrollments = MockupData.getEnrollments();
    this.alerts = MockupData.getAlerts();
    this.trainingSteps = MockupData.getTrainingSteps();
  }

  // Course methods
  public getCourses(): any[] {
    return [...this.courses];
  }

  public getPublicCourses(): any[] {
    return this.courses.filter(course => course.isPublic);
  }

  public getOrganizationCourses(organizationId: string): any[] {
    return this.courses.filter(course => !course.isPublic && course.organizationId === organizationId);
  }

  public getCourseById(id: string): any | null {
    return this.courses.find(course => course.id === id) || null;
  }

  public addCourse(course: any): void {
    this.courses.push(course);
    
    // Alert rules: Public courses alert only General Public accounts, Private courses alert specific organization
    if (course.isPublic) {
      // Public course - alert only General Public accounts
      const generalPublicAccountIds = this.accounts
        .filter(account => account.isAccountGeneralPublic)
        .map(account => account.id);
      generalPublicAccountIds.forEach(accountId => {
        this.addAlert({
          type: 'course',
          title: 'New Public Course Added',
          message: `${course.title} course is now available`
        }, accountId);
      });
    } else {
      // Private course - alert only the specific organization
      this.addAlert({
        type: 'course',
        title: 'New Organization Course Added',
        message: `${course.title} course has been created for your organization`
      }, course.organizationId);
    }
  }

  public updateCourse(id: string, updatedCourse: any): void {
    const index = this.courses.findIndex(course => course.id === id);
    if (index !== -1) {
      this.courses[index] = { ...this.courses[index], ...updatedCourse };
    }
  }

  public deleteCourse(id: string): void {
    this.courses = this.courses.filter(course => course.id !== id);
    // Also delete associated modules
    delete this.modules[id];
  }

  // Module methods
  public getModules(courseId: string): any[] {
    return this.modules[courseId] || [];
  }

  public addModule(courseId: string, module: any): void {
    if (!this.modules[courseId]) {
      this.modules[courseId] = [];
    }
    this.modules[courseId].push(module);
          // Public course - alert only general public accounts
          const generalPublicAccountIds = this.accounts
            .filter(account => account.isAccountGeneralPublic)
            .map(account => account.guid);
          generalPublicAccountIds.forEach(accountId => {
          }
          )
    
    // Add alert for new module based on course visibility
    const course = this.getCourseById(courseId);
    if (course) {
      if (course.isPublic) {
        // Public course - alert all accounts
        const allAccountIds = this.accounts.map(account => account.guid);
        allAccountIds.forEach(accountId => {
          this.addAlert({
            type: 'module',
            title: 'New Module Added to Public Course',
            message: `${module.title} module added to ${course.title}`
          }, accountId);
        });
      } else {
        // Private course - alert only the specific organization
        this.addAlert({
          type: 'module',
          title: 'New Module Added to Private Course',
          message: `${module.title} module added to ${course.title}`
        }, course.organizationId);
      }
    }
  }

  public updateModule(courseId: string, moduleId: string, updatedModule: any): void {
    if (this.modules[courseId]) {
      const index = this.modules[courseId].findIndex(module => module.id === moduleId);
      if (index !== -1) {
        this.modules[courseId][index] = { ...this.modules[courseId][index], ...updatedModule };
        
        // Update course metrics after module update
        this.updateCourseMetrics(courseId);
      }
    }
  }

  public deleteModule(courseId: string, moduleId: string): void {
    if (this.modules[courseId]) {
      this.modules[courseId] = this.modules[courseId].filter(module => module.id !== moduleId);
      
      // Update course metrics after module deletion
      this.updateCourseMetrics(courseId);
    }
  }

  // Account methods
  public getAccounts(): any[] {
    return [...this.accounts];
  }

  public getAccountById(id: string): any | null {
    return this.accounts.find(account => account.id === id) || null;
  }

  public addAccount(account: any): void {
    this.accounts.push(account);
  }

  public updateAccount(id: string, updatedAccount: any): void {
    const index = this.accounts.findIndex(account => account.id === id);
    if (index !== -1) {
      this.accounts[index] = { ...this.accounts[index], ...updatedAccount };
    }
  }

  public deleteAccount(id: string): void {
    this.accounts = this.accounts.filter(account => account.id !== id);
  }

  // Device methods
  public getDevices(): any[] {
    return [...this.devices];
  }

  public getDeviceById(id: string): any | null {
    return this.devices.find(device => device.id === id) || null;
  }

  public updateDevice(id: string, updatedDevice: any): void {
    const index = this.devices.findIndex(device => device.id === id);
    if (index !== -1) {
      this.devices[index] = { ...this.devices[index], ...updatedDevice };
    }
  }

  public deleteDevice(id: string): void {
    this.devices = this.devices.filter(device => device.id !== id);
  }

  // Training data methods
  public getTrainingData(): any[] {
    return [...this.trainingData];
  }

  public getGraduatedUsers(): any[] {
    return [...this.graduatedUsers];
  }

  public addGraduatedUserWithAlert(user: any): void {
    this.graduatedUsers.push(user);
    const targetAccountId = this.getAccountIdForUser(user.userCode);
    this.addAlert({
      type: 'graduation',
      title: 'Training Completed',
      message: `${user.name} has successfully completed their training`
    }, targetAccountId);
  }

  // Virtual users methods
  public getVirtualUsers(): any[] {
    return [...this.virtualUsers];
  }

  public addVirtualUser(user: any): void {
    // Add accountId to the user if not already present
    if (!user.accountId) {
      user.accountId = this.currentAccountId;
    }
    this.virtualUsers.push(user);
    this.addAlert({
      type: 'user',
      title: 'New Virtual User Added',
      message: `${user.name} has been added to the system`
    }, user.accountId);
  }

  public updateVirtualUser(id: string, updatedUser: any): void {
    const index = this.virtualUsers.findIndex(user => user.userCode === id);
    if (index !== -1) {
      this.virtualUsers[index] = { ...this.virtualUsers[index], ...updatedUser };
    }
  }

  public deleteVirtualUser(id: string): void {
    this.virtualUsers = this.virtualUsers.filter(user => user.userCode !== id);
  }

  // Enrollment methods
  public getEnrollments(): any[] {
    return [...this.enrollments];
  }

  public getEnrollmentsByCourse(courseId: string): any[] {
    return this.enrollments.filter(enrollment => enrollment.courseId === courseId);
  }

  public addEnrollment(enrollment: any): void {
    this.enrollments.push(enrollment);
    
    // Find the account associated with this enrollment
    const targetAccountId = this.getAccountIdForUser(enrollment.virtualUserId);
    this.addAlert({
      type: 'enrollment',
      title: 'New Enrollment',
      message: `${enrollment.userName} enrolled in course ${enrollment.courseId}`
    }, targetAccountId);
  }

  public deleteEnrollment(id: string): void {
    this.enrollments = this.enrollments.filter(enrollment => enrollment.id !== id);
  }

  public getEnrollmentCountByCourse(courseId: string): number {
    return this.enrollments.filter(enrollment => enrollment.courseId === courseId).length;
  }

  // Alert methods
  public getAlerts(accountId?: string): any[] {
    const targetAccountId = accountId || this.currentAccountId;
    return [...(this.alerts[targetAccountId] || [])];
  }

  public addAlert(alert: any, accountId?: string): void {
    const targetAccountId = accountId || this.currentAccountId;
    if (!this.alerts[targetAccountId]) {
      this.alerts[targetAccountId] = [];
    }
    this.alerts[targetAccountId].unshift({
      ...alert,
      id: this.generateId(),
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      isRead: false
    });
  }

  public markAlertAsRead(alertId: string, accountId?: string): void {
    const targetAccountId = accountId || this.currentAccountId;
    if (this.alerts[targetAccountId]) {
      const alert = this.alerts[targetAccountId].find(a => a.id === alertId);
      if (alert) {
        alert.isRead = true;
      }
    }
  }

  public clearAlert(alertId: string, accountId?: string): void {
    const targetAccountId = accountId || this.currentAccountId;
    if (this.alerts[targetAccountId]) {
      this.alerts[targetAccountId] = this.alerts[targetAccountId].filter(a => a.id !== alertId);
    }
  }

  public clearAllAlerts(accountId?: string): void {
    const targetAccountId = accountId || this.currentAccountId;
    this.alerts[targetAccountId] = [];
  }

  public getUnreadAlertCount(accountId?: string): number {
    const targetAccountId = accountId || this.currentAccountId;
    return (this.alerts[targetAccountId] || []).filter(alert => !alert.isRead).length;
  }

  // Training steps methods
  public getTrainingStepsByGuid(guid: string): any | null {
    // Find training data by GUID to get the correct training steps
    const trainingRecord = this.trainingData.find(training => training.id === guid);
    if (trainingRecord) {
      return this.trainingSteps[trainingRecord.id] || null;
    }
    return null;
  }

  // Account capacity methods
  public getAccountCapacity(accountId?: string): number {
    const targetAccountId = accountId || this.currentAccountId;
    const account = this.accounts.find(acc => acc.guid === targetAccountId);
    return account ? account.capacityPool : 50; // Default to 50 if not found
  }

  public getCurrentAccountId(): string {
    return this.currentAccountId;
  }

  public setCurrentAccountId(accountId: string): void {
    this.currentAccountId = accountId;
  }

  // Dashboard data methods
  public getImprovementData(): any[] {
    return MockupData.getImprovementData();
  }

  public getRecentTrainees(): any[] {
    return this.trainingData.slice(0, 5); // Return first 5 for recent trainees
  }

  // Utility methods
  public generateId(): string {
    return MockupData.generateId();
  }

  public generateGuid(): string {
    return MockupData.generateGuid();
  }

  // Helper methods to determine account associations
  private getAccountIdForUser(userCode: string): string {
    // Look up the virtual user to find their associated account
    const virtualUser = this.virtualUsers.find(user => 
      user.userCode === userCode || user.id === userCode
    );
    
    if (virtualUser && virtualUser.accountId) {
      return virtualUser.accountId;
    }
    
    // If no specific account association found, use current account
    return this.currentAccountId;
  }

  private updateCourseMetrics(courseId: string): void {
    const course = this.getCourseById(courseId);
    const modules = this.getModules(courseId);
    const enrollmentCount = this.getEnrollmentCountByCourse(courseId);
    
    if (course) {
      // Calculate metrics from modules
      const targetSample = modules.reduce((sum, module) => sum + (module.sampleSize || 0), 0);
      const targetTime = modules.reduce((sum, module) => sum + (parseInt(module.estimatedTime) || 0), 0);
      const numberOfModules = modules.length;
      
      // Update course with calculated metrics
      this.updateCourse(courseId, {
        targetSample,
        targetTime,
        numberOfModules,
        enrolled: enrollmentCount
      });
    }
  }

  // Override methods to trigger alerts
  public addCourseWithAlert(course: any): void {
    this.courses.push(course);
    this.addAlert({
      type: 'course',
      title: 'New Course Added',
      message: `${course.title} course has been created`
    });
  }

  public addModuleWithAlert(courseId: string, module: any): void {
    if (!this.modules[courseId]) {
      this.modules[courseId] = [];
    }
    this.modules[courseId].push(module);
    this.updateCourseMetrics(courseId);
    
    const course = this.getCourseById(courseId);
    this.addAlert({
      type: 'module',
      title: 'New Module Added',
      message: `${module.title} module added to ${course?.title || 'course'}`
    });
  }


  public addEnrollmentWithAlert(enrollment: any): void {
    this.enrollments.push(enrollment);
    const targetAccountId = this.getAccountIdForUser(enrollment.virtualUserId);
    this.addAlert({
      type: 'enrollment',
      title: 'New Enrollment',
      message: `${enrollment.userName} enrolled in course ${enrollment.courseId}`
    }, targetAccountId);
  }
}

export default DataService;