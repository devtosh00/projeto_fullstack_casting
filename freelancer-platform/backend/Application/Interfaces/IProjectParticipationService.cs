using System.Collections.Generic;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IProjectParticipationService
    {
        // Obter participações de um usuário
        Task<IEnumerable<ProjectParticipationDto>> GetUserParticipationsAsync(int userId);
        
        // Obter participações de um projeto
        Task<IEnumerable<ParticipantDto>> GetProjectParticipantsAsync(int projectId);
        
        // Adicionar um usuário como participante de um projeto
        Task<ProjectParticipationDto> AddParticipationAsync(ProjectParticipationRequestDto request);
        
        // Verificar se um usuário é participante de um projeto
        Task<bool> IsUserParticipantAsync(int projectId, int userId);
        
        // Remover um usuário como participante de um projeto
        Task<bool> RemoveParticipationAsync(int projectId, int userId);
        
        // Obter projetos públicos com vagas disponíveis
        Task<IEnumerable<ProjectDto>> GetPublicProjectsWithVacanciesAsync();
    }
} 