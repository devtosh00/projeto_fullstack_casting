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
                Status = projectDto.Status
            };

            await _context.Projects.AddAsync(project);
            await _context.SaveChangesAsync();

            return new ProjectDto
            {
                Id = project.Id,
                UserId = project.UserId,
                Description = project.Description,
                Budget = project.Budget,
                Deadline = project.Deadline,
                Status = project.Status,
                CreatedAt = project.CreatedAt
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
            var projects = await _context.Projects
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return projects.Select(p => new ProjectDto
            {
                Id = p.Id,
                UserId = p.UserId,
                Description = p.Description,
                Budget = p.Budget,
                Deadline = p.Deadline,
                Status = p.Status,
                CreatedAt = p.CreatedAt
            }).ToList();
        }
    }
} 