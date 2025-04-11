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
                Deadline = projectDto.Deadline.ToUniversalTime(),
                Status = projectDto.Status,
                CreatedAt = DateTime.UtcNow,
                IsPublic = projectDto.IsPublic,
                MaxParticipants = projectDto.MaxParticipants,
                HasVacancies = projectDto.MaxParticipants > 1
            };

            await _context.Projects.AddAsync(project);
            await _context.SaveChangesAsync();
            
            if (project.Id > 0)
            {
                var participation = new ProjectParticipation
                {
                    ProjectId = project.Id,
                    UserId = project.UserId,
                    Role = "owner",
                    JoinedAt = DateTime.UtcNow
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
                CurrentParticipants = 1
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
            var createdProjects = await _context.Projects
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
                
            var participatedProjectsIds = await _context.ProjectParticipations
                .Where(p => p.UserId == userId && p.ProjectId != 0)
                .Select(p => p.ProjectId)
                .ToListAsync();
                
            var participatedProjects = await _context.Projects
                .Where(p => participatedProjectsIds.Contains(p.Id) && p.UserId != userId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
                
            var allProjects = createdProjects.Concat(participatedProjects).ToList();
            
            var projectIds = allProjects.Select(p => p.Id).ToList();
            var participantCounts = await _context.ProjectParticipations
                .Where(p => projectIds.Contains(p.ProjectId))
                .GroupBy(p => p.ProjectId)
                .Select(g => new { ProjectId = g.Key, Count = g.Count() })
                .ToListAsync();
                
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
        
        public async Task<ProjectDto?> GetProjectByIdAsync(int projectId)
        {
            var project = await _context.Projects
                .Include(p => p.Participations!)
                    .ThenInclude(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == projectId);
                
            if (project == null)
            {
                return null;
            }
            
            int participantCount = project.Participations?.Count ?? 0;
            
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
            try
            {
                var project = await _context.Projects
                    .FirstOrDefaultAsync(p => p.Id == projectId);
                    
                if (project == null)
                {
                    return false;
                }
                
                if (project.UserId != userId)
                {
                    return false;
                }
                
                var participantCount = await _context.ProjectParticipations
                    .CountAsync(p => p.ProjectId == projectId);
                    
                project.Description = projectDto.Description;
                project.Budget = projectDto.Budget;
                project.Status = projectDto.Status;
                project.IsPublic = projectDto.IsPublic;
                project.MaxParticipants = projectDto.MaxParticipants;
                project.HasVacancies = participantCount < projectDto.MaxParticipants;
                
                project.Deadline = new DateTime(
                    projectDto.Deadline.Year,
                    projectDto.Deadline.Month,
                    projectDto.Deadline.Day,
                    projectDto.Deadline.Hour,
                    projectDto.Deadline.Minute,
                    projectDto.Deadline.Second,
                    DateTimeKind.Utc);
                
                await _context.SaveChangesAsync();
                
                return true;
            }
            catch (Exception ex)
            {
                System.Console.WriteLine($"ERRO ao atualizar projeto {projectId}: {ex.Message}");
                if (ex.InnerException != null)
                {
                    System.Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                    System.Console.WriteLine($"Inner exception stack trace: {ex.InnerException.StackTrace}");
                }
                System.Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw;
            }
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
            
            var participantCounts = await _context.ProjectParticipations
                .Where(p => projectIds.Contains(p.ProjectId))
                .GroupBy(p => p.ProjectId)
                .Select(g => new { ProjectId = g.Key, Count = g.Count() })
                .ToListAsync();
                
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
            try
            {
                var project = await _context.Projects
                    .Include(p => p.Participations!)
                    .FirstOrDefaultAsync(p => p.Id == projectId);
                    
                if (project == null)
                {
                    return false;
                }
                
                int participantCount = project.Participations?.Count ?? 0;
                
                project.HasVacancies = participantCount < project.MaxParticipants;
                
                if (project.Deadline.Kind != DateTimeKind.Utc)
                {
                    project.Deadline = project.Deadline.ToUniversalTime();
                }
                
                if (project.CreatedAt.Kind != DateTimeKind.Utc)
                {
                    project.CreatedAt = DateTime.SpecifyKind(project.CreatedAt, DateTimeKind.Utc);
                }
                
                await _context.SaveChangesAsync();
                
                return true;
            }
            catch (System.Exception ex)
            {
                System.Console.WriteLine($"Erro ao atualizar vagas do projeto: {ex.Message}");
                if (ex.InnerException != null)
                {
                    System.Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                throw;
            }
        }
    }
} 