import api from "./api";

export interface AdminStats {
  trucks: {
    active: number;
    total?: number;
  };
  drivers: {
    total: number;
    available?: number;
  };
  occurrences: {
    pending: number;
  };
  recentActivity: Array<{
    type: string;
    id: string;
    description: string;
    user: string;
    date: string;
    status: string;
  }>;
  recentChecklists: Array<{
    type: string;
    id: string;
    description: string;
    user: string;
    date: string;
    status: string;
  }>;
}

export interface DriverStats {
  truck: {
    id: string;
    plate: string;
    model: string;
    brand: string;
  } | null;
  lastChecklist: {
    id: string;
    date: string;
    truckPlate: string;
    isApproved: boolean;
  } | null;
  recentOccurrences: Array<{
    id: string;
    type: string;
    date: string;
    status: string;
    truckPlate: string;
  }>;
  stats: {
    tripsThisMonth: number;
  };
}

export const dashboardService = {
  getAdminStats: async (): Promise<AdminStats> => {
    const response = await api.get("/dashboard/admin-stats");
    return response.data;
  },

  getDriverStats: async (): Promise<DriverStats> => {
    const response = await api.get("/dashboard/driver-stats");
    return response.data;
  },

  getFinancialStats: async (period: string = "mes"): Promise<any> => {
    const response = await api.get(
      `/dashboard/financial-stats?period=${period}`,
    );
    return response.data;
  },
};
