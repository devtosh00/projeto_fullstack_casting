/**
 * Representa os possíveis estados de um projeto
 */
export enum ProjectStatus {
  OPEN = 'aberto',
  IN_PROGRESS = 'em andamento',
  COMPLETED = 'finalizado'
}

/**
 * Interface principal para representar um Projeto
 */
export interface Project {
  // Dados essenciais
  id?: number;
  userId: number;
  description: string;
  budget: number;
  deadline: Date | string;
  
  // Dados complementares
  userName?: string;
  status: ProjectStatus;
  
  // Configurações de participação
  isPublic: boolean;
  hasVacancies: boolean;
  maxParticipants: number;
  openVacancies?: number;
  currentParticipants?: number;
  
  // Metadados
  createdAt?: Date;
  participants?: ProjectParticipant[];
}

/**
 * Interface para o payload esperado pela API ao criar um projeto
 * Utiliza o padrão de nomenclatura PascalCase que o backend .NET espera
 */
export interface ProjectCreatePayload {
  UserId: number;
  Description: string;
  Budget: number;
  Deadline: string;
  Status: ProjectStatus | string;
  IsPublic: boolean;
  MaxParticipants: number;
  HasVacancies: boolean;
}

/**
 * Interface que representa a participação de um usuário em um projeto
 */
export interface ProjectParticipant {
  // Dados de identificação
  id: number;
  projectId: number;
  userId: number;
  
  // Dados da participação
  role: string;
  joinedAt: string;
  
  // Dados do usuário (opcional)
  username?: string;
  email?: string;
} 