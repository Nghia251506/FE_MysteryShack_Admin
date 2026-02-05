export interface SessionDashboardDTO {
  id: string;
  cName: string;
  cId: string;
  rName: string;
  rId: string;
  topic: string;
  question: string;
  status: string;
  time: string;
}

export interface DashboardStatsDTO {
  totalSessionsToday: number;
  activeSessions: number;
  onlineReaders: number;
  newCustomersToday: number;
  sessionGrowth: number;
  activeGrowth: number;
  readerGrowth: number;
  customerGrowth: number;
}

export interface TopReader {
  id: number;
  fullName: string;
  eloScore: number;
  profilePicture: string;
  isActive: boolean;
}