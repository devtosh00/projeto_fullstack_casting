using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProjectsController : ControllerBase
    {
        private readonly IProjectService _projectService;
        private readonly IProjectParticipationService _participationService;

        public ProjectsController(
            IProjectService projectService,
            IProjectParticipationService participationService)
        {
            _projectService = projectService;
            _participationService = participationService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateProject([FromBody] ProjectCreationDto projectDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Obter o ID do usuário do token JWT
            var userId = GetCurrentUserId();
            
            // Assegurar que o usuário só cria projetos para si mesmo
            projectDto.UserId = userId;

            var result = await _projectService.CreateProjectAsync(projectDto);
            return CreatedAtAction(nameof(GetUserProjects), new { userId = result.UserId }, result);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserProjects(int userId)
        {
            // Somente permitir que o usuário veja seus próprios projetos
            var currentUserId = GetCurrentUserId();
            if (userId != currentUserId)
            {
                return Forbid();
            }

            var projects = await _projectService.GetUserProjectsAsync(userId);
            return Ok(projects);
        }
        
        [HttpGet("details/{projectId}")]
        public async Task<IActionResult> GetProjectDetails(int projectId)
        {
            var userId = GetCurrentUserId();
            var project = await _projectService.GetProjectByIdAsync(projectId);
            
            if (project == null)
            {
                return NotFound("Projeto não encontrado.");
            }
            
            // Se o projeto não é público, verificar se o usuário é o proprietário ou participante
            if (!project.IsPublic)
            {
                bool isOwner = project.UserId == userId;
                bool isParticipant = await _participationService.IsUserParticipantAsync(projectId, userId);
                
                if (!isOwner && !isParticipant)
                {
                    return Forbid();
                }
            }
            
            return Ok(project);
        }
        
        [HttpPut("{projectId}")]
        public async Task<IActionResult> UpdateProject(int projectId, [FromBody] ProjectCreationDto projectDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            var userId = GetCurrentUserId();
            
            // Verificar se o usuário é o proprietário do projeto
            var isOwner = await _projectService.IsProjectOwnerAsync(projectId, userId);
            if (!isOwner)
            {
                return Forbid();
            }
            
            var result = await _projectService.UpdateProjectAsync(projectId, projectDto, userId);
            
            if (!result)
            {
                return NotFound("Projeto não encontrado ou você não tem permissão para editá-lo.");
            }
            
            return NoContent();
        }

        [HttpDelete("{projectId}")]
        public async Task<IActionResult> DeleteProject(int projectId)
        {
            var userId = GetCurrentUserId();
            var result = await _projectService.DeleteProjectAsync(projectId, userId);

            if (!result)
            {
                return NotFound("Projeto não encontrado ou você não tem permissão para excluí-lo.");
            }

            return NoContent();
        }
        
        [HttpGet("public")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublicProjects()
        {
            var projects = await _projectService.GetPublicProjectsWithVacanciesAsync();
            return Ok(projects);
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            
            if (userIdClaim == null)
            {
                throw new UnauthorizedAccessException("Usuário não autenticado ou ID não encontrado no token.");
            }

            return int.Parse(userIdClaim.Value);
        }
    }
} 