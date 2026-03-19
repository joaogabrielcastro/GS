import axios from "axios";
import { API_URL } from "@/config/env";
import type {
  AdminNotification,
  DailyChecklist,
  Occurrence,
  Tire,
  Truck,
  User,
} from "@/types";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
  requestId?: string;
}

interface ApiErrorEnvelope {
  success: false;
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
  requestId?: string;
}

function isSuccessEnvelope<T>(data: unknown): data is ApiSuccessEnvelope<T> {
  return Boolean(
    data &&
      typeof data === "object" &&
      (data as { success?: unknown }).success === true &&
      "data" in (data as Record<string, unknown>),
  );
}

export function getApiErrorMessage(error: unknown, fallback = "Erro na requisição") {
  const axiosError = error as {
    response?: { data?: ApiErrorEnvelope | { error?: string; message?: string } };
  };
  const data = axiosError.response?.data;
  if (!data || typeof data !== "object") return fallback;

  if ("error" in data && typeof data.error === "object" && data.error?.message) {
    return data.error.message;
  }
  if ("error" in data && typeof data.error === "string") {
    return data.error;
  }
  if ("message" in data && typeof data.message === "string") {
    return data.message;
  }
  return fallback;
}

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
  (response) => {
    if (isSuccessEnvelope(response.data)) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/refresh-token")
    ) {
      originalRequest._retry = true;

      try {
        const response = await api.post("/auth/refresh-token");
        const { token } = response.data;
        localStorage.setItem("token", token);

        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (err) {
        // Se o refresh falhar, redirecionar para login
        localStorage.removeItem("token");
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
  updateProfile: async (data: Partial<Pick<User, "name" | "phone">> & { currentPassword?: string; newPassword?: string }) => {
    const response = await api.put("/auth/profile", data);
    return response.data;
  },
  createUser: async (data: {
    email: string;
    password: string;
    name: string;
    cpf?: string;
    phone?: string;
    role: "MOTORISTA" | "ADMINISTRADOR" | "FINANCEIRO";
  }) => {
    const response = await api.post("/auth/users", data);
    return response.data;
  },
};

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const truckService = {
  list: async (opts?: { page?: number; limit?: number; status?: string }) => {
    const params: Record<string, string> = {};
    if (opts?.page) params.page = String(opts.page);
    if (opts?.limit) params.limit = String(opts.limit);
    if (opts?.status) params.status = opts.status;
    const response = await api.get("/trucks", { params });
    return response.data as PaginatedResponse<Truck>;
  },
  listAll: async () => {
    const response = await api.get("/trucks");
    return response.data as Truck[];
  },
  create: async (data: Record<string, unknown>) => {
    const response = await api.post("/trucks", data);
    return response.data;
  },
  update: async (id: string, data: Record<string, unknown>) => {
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
    return response.data as { message: string; photoUrls: Record<string, string> };
  },
  create: async (data: Record<string, unknown>) => {
    const response = await api.post("/checklists", data);
    return response.data;
  },
  list: async (opts?: { page?: number; limit?: number }) => {
    const params: Record<string, string> = {};
    if (opts?.page) params.page = String(opts.page);
    if (opts?.limit) params.limit = String(opts.limit);
    const response = await api.get("/checklists", { params });
    return response.data as PaginatedResponse<DailyChecklist>;
  },
  getById: async (id: string) => {
    const response = await api.get(`/checklists/${id}`);
    return response.data as DailyChecklist;
  },
};

export const occurrenceService = {
  uploadPhotos: async (formData: FormData) => {
    const response = await api.post("/occurrences/upload-photos", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data as { message: string; photoUrls: string[] };
  },
  create: async (data: Record<string, unknown>) => {
    const response = await api.post("/occurrences", data);
    return response.data;
  },
  list: async (opts?: { page?: number; limit?: number }) => {
    const params: Record<string, string> = {};
    if (opts?.page) params.page = String(opts.page);
    if (opts?.limit) params.limit = String(opts.limit);
    const response = await api.get("/occurrences", { params });
    return response.data as PaginatedResponse<Occurrence>;
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
    filters: {
      truckId?: string;
      status?: string;
      active?: boolean;
      page?: number;
      limit?: number;
    } = {},
  ) => {
    const params = new URLSearchParams();
    if (filters.truckId) params.append("truckId", filters.truckId);
    if (filters.status) params.append("status", filters.status);
    if (filters.active !== undefined)
      params.append("active", String(filters.active));
    if (filters.page) params.append("page", String(filters.page));
    if (filters.limit) params.append("limit", String(filters.limit));

    const response = await api.get(`/tires?${params.toString()}`);
    return response.data as PaginatedResponse<Tire>;
  },
  create: async (data: Record<string, unknown>) => {
    const response = await api.post("/tires", data);
    return response.data;
  },
  update: async (id: string, data: Record<string, unknown>) => {
    const response = await api.put(`/tires/${id}`, data);
    return response.data as Tire;
  },
  getById: async (id: string) => {
    const response = await api.get(`/tires/${id}`);
    return response.data as Record<string, unknown>;
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
    return response.data as Tire[];
  },
  registerEvent: async (id: string, data: Record<string, unknown>) => {
    const response = await api.post(`/tires/${id}/event`, data);
    return response.data;
  },
};

export const notificationService = {
  list: async () => {
    const response = await api.get("/notifications");
    return response.data as AdminNotification[];
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
