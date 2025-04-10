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

        public ProjectsController(IProjectService projectService)
        {
            _projectService = projectService;
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

        [HttpGet("{userId}")]
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