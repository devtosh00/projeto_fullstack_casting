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
    public class ProjectParticipationService : IProjectParticipationService
    {
        private readonly IApplicationDbContext _context;
        private readonly IProjectService _projectService;

        public ProjectParticipationService(IApplicationDbContext context, IProjectService projectService)
        {
            _context = context;
            _projectService = projectService;
        }

        public async Task<IEnumerable<ProjectParticipationDto>> GetUserParticipationsAsync(int userId)
        {
            var participations = await _context.ProjectParticipations
                .Where(p => p.UserId == userId)
                .Include(p => p.Project)
                .Include(p => p.User)
                .OrderByDescending(p => p.JoinedAt)
                .ToListAsync();

            return participations.Select(p => new ProjectParticipationDto
            {
                Id = p.Id,
                ProjectId = p.ProjectId,
                UserId = p.UserId,
                Role = p.Role,
                JoinedAt = p.JoinedAt,
                Username = p.User?.Username,
                ProjectDescription = p.Project?.Description
            }).ToList();
        }

        public async Task<IEnumerable<ParticipantDto>> GetProjectParticipantsAsync(int projectId)
        {
            var participants = await _context.ProjectParticipations
                .Where(p => p.ProjectId == projectId)
                .Include(p => p.User)
                .OrderBy(p => p.Role) // Proprietários primeiro
                .ThenBy(p => p.JoinedAt)
                .ToListAsync();

            return participants.Select(p => new ParticipantDto
            {
                UserId = p.UserId,
                Username = p.User?.Username ?? "Usuário Desconhecido",
                Role = p.Role,
                JoinedAt = p.JoinedAt
            }).ToList();
        }

        public async Task<ProjectParticipationDto> AddParticipationAsync(ProjectParticipationRequestDto request)
        {
            // Verificar se o projeto existe e tem vagas
            var project = await _context.Projects
                .Include(p => p.Participations)
                .FirstOrDefaultAsync(p => p.Id == request.ProjectId);

            if (project == null)
            {
                throw new KeyNotFoundException("Projeto não encontrado.");
            }

            // Verificar se o projeto é público
            if (!project.IsPublic)
            {
                throw new InvalidOperationException("Não é possível participar de um projeto privado.");
            }

            // Calcular número atual de participantes
            int currentParticipants = project.Participations?.Count ?? 0;

            // Verificar se há vagas disponíveis
            if (currentParticipants >= project.MaxParticipants)
            {
                throw new InvalidOperationException("Não há vagas disponíveis para este projeto.");
            }

            // Verificar se o usuário já é participante
            var existingParticipation = await _context.ProjectParticipations
                .FirstOrDefaultAsync(p => p.ProjectId == request.ProjectId && p.UserId == request.UserId);

            if (existingParticipation != null)
            {
                throw new InvalidOperationException("Você já é participante deste projeto.");
            }

            // Adicionar participação
            var participation = new ProjectParticipation
            {
                ProjectId = request.ProjectId,
                UserId = request.UserId,
                Role = "participant", // Default role
                JoinedAt = System.DateTime.UtcNow
            };

            await _context.ProjectParticipations.AddAsync(participation);
            await _context.SaveChangesAsync();

            // Atualizar flag de vagas disponíveis
            await _projectService.UpdateProjectVacanciesAsync(request.ProjectId);

            // Carregar dados relacionados para o retorno
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.UserId);

            return new ProjectParticipationDto
            {
                Id = participation.Id,
                ProjectId = participation.ProjectId,
                UserId = participation.UserId,
                Role = participation.Role,
                JoinedAt = participation.JoinedAt,
                Username = user?.Username,
                ProjectDescription = project.Description
            };
        }

        public async Task<bool> IsUserParticipantAsync(int projectId, int userId)
        {
            return await _context.ProjectParticipations
                .AnyAsync(p => p.ProjectId == projectId && p.UserId == userId);
        }

        public async Task<bool> IsUserProjectOwnerAsync(int projectId, int userId)
        {
            // Delegamos para o ProjectService para verificar propriedade do projeto
            return await _projectService.IsProjectOwnerAsync(projectId, userId);
        }

        public async Task<bool> RemoveParticipationAsync(int projectId, int userId)
        {
            // Verificar se o usuário é o proprietário do projeto (não pode sair se for o dono)
            var isOwner = await _projectService.IsProjectOwnerAsync(projectId, userId);
            if (isOwner)
            {
                throw new InvalidOperationException("O proprietário do projeto não pode sair do projeto.");
            }

            var participation = await _context.ProjectParticipations
                .FirstOrDefaultAsync(p => p.ProjectId == projectId && p.UserId == userId);

            if (participation == null)
            {
                return false;
            }

            _context.ProjectParticipations.Remove(participation);
            await _context.SaveChangesAsync();

            // Atualizar flag de vagas disponíveis
            await _projectService.UpdateProjectVacanciesAsync(projectId);

            return true;
        }

        public async Task<IEnumerable<ProjectDto>> GetPublicProjectsWithVacanciesAsync()
        {
            // Delegamos para o ProjectService para evitar duplicação de código
            return await _projectService.GetPublicProjectsWithVacanciesAsync();
        }
    }
} 