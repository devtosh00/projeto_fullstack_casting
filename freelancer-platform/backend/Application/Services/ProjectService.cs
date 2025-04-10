using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using Contracts.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Application.Services
{
    public class ProjectService : IProjectService
    {
        private readonly IApplicationDbContext _context;

        public ProjectService(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ProjectDto> CreateProjectAsync(ProjectCreationDto projectDto)
        {
            var project = new Project
            {
                UserId = projectDto.UserId,
                Description = projectDto.Description,
                Budget = projectDto.Budget,
                Deadline = projectDto.Deadline,
                Status = projectDto.Status,
                IsPublic = projectDto.IsPublic,
                MaxParticipants = projectDto.MaxParticipants,
                HasVacancies = projectDto.MaxParticipants > 1 // Se MaxParticipants > 1, considera que tem vagas
            };

            await _context.Projects.AddAsync(project);
            await _context.SaveChangesAsync();
            
            // Se o projeto foi criado, adicionar o criador como participante (owner)
            if (project.Id > 0)
            {
                var participation = new ProjectParticipation
                {
                    ProjectId = project.Id,
                    UserId = project.UserId,
                    Role = "owner",
                    JoinedAt = System.DateTime.UtcNow
                };
                
                await _context.ProjectParticipations.AddAsync(participation);
                await _context.SaveChangesAsync();
            }

            return new ProjectDto
            {
                Id = project.Id,
                UserId = project.UserId,
                Description = project.Description,
                Budget = project.Budget,
                Deadline = project.Deadline,
                Status = project.Status,
                CreatedAt = project.CreatedAt,
                IsPublic = project.IsPublic,
                MaxParticipants = project.MaxParticipants,
                HasVacancies = project.HasVacancies,
                CurrentParticipants = 1 // O criador já conta como um participante
            };
        }

        public async Task<bool> DeleteProjectAsync(int projectId, int userId)
        {
            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);

            if (project == null)
            {
                return false;
            }

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<ProjectDto>> GetUserProjectsAsync(int userId)
        {
            // Buscar projetos que o usuário criou
            var createdProjects = await _context.Projects
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
                
            // Buscar projetos em que o usuário participa
            var participatedProjectsIds = await _context.ProjectParticipations
                .Where(p => p.UserId == userId && p.ProjectId != 0)
                .Select(p => p.ProjectId)
                .ToListAsync();
                
            // Buscar detalhes dos projetos participados que não foram criados pelo usuário
            var participatedProjects = await _context.Projects
                .Where(p => participatedProjectsIds.Contains(p.Id) && p.UserId != userId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
                
            // Combinar as listas e converter para DTOs
            var allProjects = createdProjects.Concat(participatedProjects).ToList();
            
            // Buscar o número de participantes para cada projeto
            var projectIds = allProjects.Select(p => p.Id).ToList();
            var participantCounts = await _context.ProjectParticipations
                .Where(p => projectIds.Contains(p.ProjectId))
                .GroupBy(p => p.ProjectId)
                .Select(g => new { ProjectId = g.Key, Count = g.Count() })
                .ToListAsync();
                
            // Criar um dicionário para acesso rápido ao número de participantes
            var countByProjectId = participantCounts.ToDictionary(p => p.ProjectId, p => p.Count);

            return allProjects.Select(p => new ProjectDto
            {
                Id = p.Id,
                UserId = p.UserId,
                Description = p.Description,
                Budget = p.Budget,
                Deadline = p.Deadline,
                Status = p.Status,
                CreatedAt = p.CreatedAt,
                IsPublic = p.IsPublic,
                MaxParticipants = p.MaxParticipants,
                HasVacancies = p.HasVacancies,
                CurrentParticipants = countByProjectId.ContainsKey(p.Id) ? countByProjectId[p.Id] : 0
            }).ToList();
        }
        
        public async Task<ProjectDto> GetProjectByIdAsync(int projectId)
        {
            var project = await _context.Projects
                .Include(p => p.Participations)
                    .ThenInclude(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == projectId);
                
            if (project == null)
            {
                return null;
            }
            
            // Contar participantes
            int participantCount = project.Participations?.Count ?? 0;
            
            // Mapear participantes para DTOs
            var participants = project.Participations?.Select(p => new ParticipantDto
            {
                UserId = p.UserId,
                Username = p.User?.Username ?? "Usuário Desconhecido",
                Role = p.Role,
                JoinedAt = p.JoinedAt
            }).ToList();

            return new ProjectDto
            {
                Id = project.Id,
                UserId = project.UserId,
                Description = project.Description,
                Budget = project.Budget,
                Deadline = project.Deadline,
                Status = project.Status,
                CreatedAt = project.CreatedAt,
                IsPublic = project.IsPublic,
                MaxParticipants = project.MaxParticipants,
                HasVacancies = project.HasVacancies,
                CurrentParticipants = participantCount,
                Participants = participants
            };
        }
        
        public async Task<bool> UpdateProjectAsync(int projectId, ProjectCreationDto projectDto, int userId)
        {
            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);
                
            if (project == null)
            {
                return false;
            }
            
            // Atualizar propriedades
            project.Description = projectDto.Description;
            project.Budget = projectDto.Budget;
            project.Deadline = projectDto.Deadline;
            project.Status = projectDto.Status;
            project.IsPublic = projectDto.IsPublic;
            project.MaxParticipants = projectDto.MaxParticipants;
            
            // Atualizar a flag de vagas disponíveis
            await UpdateProjectVacanciesAsync(projectId);
            
            _context.Projects.Update(project);
            await _context.SaveChangesAsync();
            
            return true;
        }
        
        public async Task<bool> IsProjectOwnerAsync(int projectId, int userId)
        {
            return await _context.Projects
                .AnyAsync(p => p.Id == projectId && p.UserId == userId);
        }
        
        public async Task<IEnumerable<ProjectDto>> GetPublicProjectsWithVacanciesAsync()
        {
            var publicProjects = await _context.Projects
                .Where(p => p.IsPublic && p.HasVacancies)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
                
            var projectIds = publicProjects.Select(p => p.Id).ToList();
            
            // Buscar o número de participantes para cada projeto
            var participantCounts = await _context.ProjectParticipations
                .Where(p => projectIds.Contains(p.ProjectId))
                .GroupBy(p => p.ProjectId)
                .Select(g => new { ProjectId = g.Key, Count = g.Count() })
                .ToListAsync();
                
            // Criar um dicionário para acesso rápido ao número de participantes
            var countByProjectId = participantCounts.ToDictionary(p => p.ProjectId, p => p.Count);
            
            return publicProjects.Select(p => new ProjectDto
            {
                Id = p.Id,
                UserId = p.UserId,
                Description = p.Description,
                Budget = p.Budget,
                Deadline = p.Deadline,
                Status = p.Status,
                CreatedAt = p.CreatedAt,
                IsPublic = p.IsPublic,
                MaxParticipants = p.MaxParticipants,
                HasVacancies = p.HasVacancies,
                CurrentParticipants = countByProjectId.ContainsKey(p.Id) ? countByProjectId[p.Id] : 0
            }).ToList();
        }
        
        public async Task<bool> UpdateProjectVacanciesAsync(int projectId)
        {
            var project = await _context.Projects
                .Include(p => p.Participations)
                .FirstOrDefaultAsync(p => p.Id == projectId);
                
            if (project == null)
            {
                return false;
            }
            
            // Contar participantes
            int participantCount = project.Participations?.Count ?? 0;
            
            // Atualizar flag de vagas disponíveis
            project.HasVacancies = participantCount < project.MaxParticipants;
            
            _context.Projects.Update(project);
            await _context.SaveChangesAsync();
            
            return true;
        }
    }
} 