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
    }
} 