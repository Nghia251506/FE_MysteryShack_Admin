import { DashboardStatsDTO, SessionDashboardDTO, TopReader } from '@/types/dashboard';
import axios from '../lib/axios';

const API_URL = '/v1/admin/dashboard';

export const dashboardService = {
  getStats: () => axios.get<DashboardStatsDTO>(`${API_URL}/stats`),
  
  getHourlyChart: () => axios.get(`${API_URL}/hourly-chart`),
  
  // Dùng chung cho cả load mặc định và search
  getSessions: (search?: string) => 
    axios.get<SessionDashboardDTO[]>(`${API_URL}/recent-sessions`, {
      params: { search }
    }),
    
  getTopReaders: () => axios.get<TopReader[]>(`${API_URL}/top-readers`),
};