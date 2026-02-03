export type UserRole = 'MOTORISTA' | 'ADMINISTRADOR' | 'FINANCEIRO';

export interface User {
  id: string;
  email: string;
  name: string;
  cpf?: string;
  phone?: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface Truck {
  id: string;
  plate: string;
  model: string;
  brand: string;
  year: number;
  status: 'ATIVO' | 'MANUTENCAO' | 'PARADO' | 'INATIVO';
  currentDriverId?: string;
  currentDriver?: User;
  totalKm: number;
  acquisitionDate?: string;
  lastMaintenanceDate?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
  tires?: Tire[];
}

export interface Tire {
  id: string;
  code: string;
  brand: string;
  model: string;
  position: string;
  status: 'NOVO' | 'BOM' | 'DESGASTADO' | 'RECAPADO' | 'SUBSTITUIDO' | 'DESCARTADO';
  installationDate: string;
  initialKm: number;
  currentKm: number;
  cost: number;
  lifeExpectancyKm?: number;
  truckId: string;
  truck?: Truck;
  active: boolean;
  notes?: string;
  events?: TireEvent[];
}

export interface TireEvent {
  id: string;
  tireId: string;
  eventType: 'INSTALACAO' | 'REMOCAO' | 'ESTOURO' | 'TROCA' | 'RECAPAGEM' | 'MANUTENCAO' | 'DESGASTE';
  description: string;
  kmAtEvent: number;
  cost?: number;
  photoUrl?: string;
  createdAt: string;
}

export interface DailyChecklist {
  id: string;
  truckId: string;
  driverId: string;
  date: string;
  cabinPhotoUrl?: string;
  tiresPhotoUrl?: string;
  canvasPhotoUrl?: string;
  overallCondition?: string;
  notes?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  truck?: Truck;
  driver?: User;
  createdAt: string;
}

export interface Occurrence {
  id: string;
  type: 'PNEU_ESTOURADO' | 'PROBLEMA_MECANICO' | 'LONA_RASGADA' | 'ACIDENTE' | 'MANUTENCAO' | 'OUTRO';
  status: 'PENDENTE' | 'EM_ANALISE' | 'APROVADO' | 'REJEITADO' | 'RESOLVIDO';
  description: string;
  truckId: string;
  driverId: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  photoUrls: string[];
  estimatedCost?: number;
  actualCost?: number;
  hasFinalcialImpact: boolean;
  resolutionNotes?: string;
  occurredAt: string;
  resolvedAt?: string;
  truck?: Truck;
  driver?: User;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  occurrenceId?: string;
  occurrence?: Occurrence;
  read: boolean;
  readAt?: string;
  createdAt: string;
}
