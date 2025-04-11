import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JobPosition, JobApplication } from '../models/job-position.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JobPositionService {
  private apiUrl = `${environment.apiUrl}/api/JobPositions`;
  private applicationsUrl = `${environment.apiUrl}/api/JobApplications`;

  constructor(private http: HttpClient) { }

  // Métodos para vagas
  getJobPositions(): Observable<JobPosition[]> {
    return this.http.get<JobPosition[]>(this.apiUrl);
  }

  getJobPositionsByProject(projectId: number): Observable<JobPosition[]> {
    return this.http.get<JobPosition[]>(`${this.apiUrl}/project/${projectId}`);
  }

  getJobPosition(id: number): Observable<JobPosition> {
    return this.http.get<JobPosition>(`${this.apiUrl}/${id}`);
  }

  createJobPosition(jobPosition: Partial<JobPosition>): Observable<JobPosition> {
    return this.http.post<JobPosition>(this.apiUrl, jobPosition);
  }

  updateJobPosition(id: number, jobPosition: Partial<JobPosition>): Observable<JobPosition> {
    return this.http.put<JobPosition>(`${this.apiUrl}/${id}`, jobPosition);
  }

  deleteJobPosition(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Métodos para candidaturas
  getApplications(jobPositionId: number): Observable<JobApplication[]> {
    return this.http.get<JobApplication[]>(`${this.applicationsUrl}/position/${jobPositionId}`);
  }

  getUserApplications(userId: number): Observable<JobApplication[]> {
    return this.http.get<JobApplication[]>(`${this.applicationsUrl}/user/${userId}`);
  }

  applyForJob(application: Partial<JobApplication>): Observable<JobApplication> {
    return this.http.post<JobApplication>(this.applicationsUrl, application);
  }

  updateApplication(id: number, status: string): Observable<JobApplication> {
    return this.http.put<JobApplication>(`${this.applicationsUrl}/${id}`, { status });
  }

  deleteApplication(id: number): Observable<void> {
    return this.http.delete<void>(`${this.applicationsUrl}/${id}`);
  }
} 