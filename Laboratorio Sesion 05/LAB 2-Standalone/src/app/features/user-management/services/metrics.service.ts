import { Injectable, computed, inject } from '@angular/core';
import { UserService } from './user.service';

export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByRole: Record<string, number>;
  averageProjectsPerUser: number;
  departmentDistribution: Record<string, number>;
  recentlyActive: number;
  growthRate: number;
}

@Injectable({
  providedIn: 'root'
})
export class MetricsService {
  private userService = inject(UserService);
  
  metrics = computed((): UserMetrics => {
    const users = this.userService.users();
    
    if (users.length === 0) {
      return this.getEmptyMetrics();
    }
    
    const departmentCount = users.reduce((acc, user) => {
      acc[user.department] = (acc[user.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentlyActive = users.filter(u => 
      u.active && new Date(u.lastLogin) > weekAgo
    ).length;
    
    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.active).length,
      inactiveUsers: users.filter(u => !u.active).length,
      usersByRole: {
        admin: users.filter(u => u.role === 'admin').length,
        manager: users.filter(u => u.role === 'manager').length,
        developer: users.filter(u => u.role === 'developer').length,
        viewer: users.filter(u => u.role === 'viewer').length
      },
      averageProjectsPerUser: users.length > 0 
        ? users.reduce((sum, u) => sum + u.projects.length, 0) / users.length 
        : 0,
      departmentDistribution: departmentCount,
      recentlyActive,
      growthRate: this.calculateGrowthRate(users)
    };
  });

  // Métricas específicas por departamento
  departmentMetrics = computed(() => {
    const users = this.userService.users();
    const departments = this.userService.usersByDepartment();
    const metrics = new Map<string, any>();

    departments.forEach((deptUsers, department) => {
      const activeCount = deptUsers.filter(u => u.active).length;
      const avgProjects = deptUsers.reduce((sum, u) => sum + u.projects.length, 0) / deptUsers.length;
      
      metrics.set(department, {
        total: deptUsers.length,
        active: activeCount,
        inactive: deptUsers.length - activeCount,
        averageProjects: Math.round(avgProjects * 10) / 10,
        roles: deptUsers.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });
    });

    return metrics;
  });

  // Tendencias temporales
  trends = computed(() => {
    const users = this.userService.users();
    const now = new Date();
    
    return {
      lastWeekLogins: users.filter(u => {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return new Date(u.lastLogin) > weekAgo;
      }).length,
      lastMonthLogins: users.filter(u => {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return new Date(u.lastLogin) > monthAgo;
      }).length,
      activePercentage: users.length > 0 
        ? Math.round((users.filter(u => u.active).length / users.length) * 100)
        : 0
    };
  });
  
  private getEmptyMetrics(): UserMetrics {
    return {
      totalUsers: 0,
      activeUsers: 0,
      inactiveUsers: 0,
      usersByRole: {},
      averageProjectsPerUser: 0,
      departmentDistribution: {},
      recentlyActive: 0,
      growthRate: 0
    };
  }

  private calculateGrowthRate(users: any[]): number {
    // Simular cálculo de tasa de crecimiento
    // En una aplicación real, esto vendría de datos históricos
    const baseGrowth = Math.random() * 20 - 5; // Entre -5% y 15%
    return Math.round(baseGrowth * 10) / 10;
  }
}
