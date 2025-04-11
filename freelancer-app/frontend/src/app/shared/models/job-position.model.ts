export interface JobPosition {
  id: number;
  projectId: number;
  title: string;
  description: string;
  requiredSkills: string[];
  salary: number;
  deadline: string;
  status: 'aberta' | 'fechada';
  createdAt?: string;
}

export interface JobApplication {
  id: number;
  jobPositionId: number;
  userId: number;
  proposedSalary: number;
  coverLetter: string;
  status: 'pendente' | 'aceita' | 'recusada';
  createdAt?: string;
} 