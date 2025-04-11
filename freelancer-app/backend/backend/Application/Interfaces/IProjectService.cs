using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IProjectService
    {
        Task<ProjectDto> CreateProjectAsync(ProjectCreationDto projectDto);
        Task<bool> DeleteProjectAsync(int projectId, int userId);
        Task<IEnumerable<ProjectDto>> GetUserProjectsAsync(int userId);
        Task<ProjectDto?> GetProjectByIdAsync(int projectId);
        Task<bool> UpdateProjectAsync(int projectId, ProjectCreationDto projectDto, int userId);
        Task<bool> IsProjectOwnerAsync(int projectId, int userId);
        Task<IEnumerable<ProjectDto>> GetPublicProjectsWithVacanciesAsync();
        Task<bool> UpdateProjectVacanciesAsync(int projectId);
    }
} 