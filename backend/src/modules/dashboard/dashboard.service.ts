import { dashboardRepository } from './dashboard.repository';
import { DashboardData } from './dashboard.types';

export class DashboardService {
  async getDashboard(userId: string): Promise<DashboardData> {
    return dashboardRepository.getDashboardData(userId);
  }
}

export const dashboardService = new DashboardService();
