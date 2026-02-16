import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post("/api/auth/refresh-token", {
            refreshToken,
          });

          const { token } = response.data;
          localStorage.setItem("token", token);

          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (err) {
        // Se o refresh falhar, redirecionar para login
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

// Adicionando serviço de caminhões se não existir, ou extendendo api
export const authService = {
  listUsers: async (role?: string) => {
    const params = role ? { role } : {};
    const response = await api.get("/auth/users", { params });
    return response.data;
  },
  updateProfile: async (data: any) => {
    const response = await api.put("/auth/profile", data);
    return response.data;
  },
  createUser: async (data: any) => {
    const response = await api.post("/auth/users", data);
    return response.data;
  },
};

export const truckService = {
  list: async () => {
    const response = await api.get("/trucks");
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post("/trucks", data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/trucks/${id}`, data);
    return response.data;
  },
  getAvailable: async () => {
    const response = await api.get("/trucks/available/list");
    return response.data;
  },
  selectTruck: async (truckId: string) => {
    const response = await api.post("/trucks/select", { truckId });
    return response.data;
  },
  releaseTruck: async () => {
    const response = await api.post("/trucks/release");
    return response.data;
  },
};

export const checklistService = {
  uploadPhotos: async (formData: FormData) => {
    const response = await api.post("/checklists/upload-photos", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data; // { photoUrls: { ... } }
  },
  create: async (data: any) => {
    const response = await api.post("/checklists", data);
    return response.data;
  },
  list: async () => {
    const response = await api.get("/checklists");
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/checklists/${id}`);
    return response.data;
  },
};

export const occurrenceService = {
  uploadPhotos: async (formData: FormData) => {
    const response = await api.post("/occurrences/upload-photos", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data; // { photoUrls: [...] }
  },
  create: async (data: any) => {
    const response = await api.post("/occurrences", data);
    return response.data;
  },
  list: async () => {
    const response = await api.get("/occurrences");
    return response.data;
  },
  updateStatus: async (
    id: string,
    data: { status: string; resolutionNotes?: string; actualCost?: number },
  ) => {
    const response = await api.put(`/occurrences/${id}/status`, data);
    return response.data;
  },
};

export const tireService = {
  list: async (
    filters: { truckId?: string; status?: string; active?: boolean } = {},
  ) => {
    const params = new URLSearchParams();
    if (filters.truckId) params.append("truckId", filters.truckId);
    if (filters.status) params.append("status", filters.status);
    if (filters.active !== undefined)
      params.append("active", String(filters.active));

    const response = await api.get(`/tires?${params.toString()}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post("/tires", data);
    return response.data;
  },
  getStatistics: async (truckId?: string) => {
    const url = truckId
      ? `/tires/statistics?truckId=${truckId}`
      : "/tires/statistics";
    const response = await api.get(url);
    return response.data;
  },
  getAlerts: async () => {
    const response = await api.get("/tires/alerts");
    return response.data;
  },
  registerEvent: async (id: string, data: any) => {
    const response = await api.post(`/tires/${id}/event`, data);
    return response.data;
  },
};

export const notificationService = {
  list: async () => {
    const response = await api.get("/notifications");
    return response.data;
  },
  markAsRead: async (id: string) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await api.post("/notifications/mark-all-read");
    return response.data;
  },
};

export default api;
