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
    public class ProjectParticipationsController : ControllerBase
    {
        private readonly IProjectParticipationService _participationService;

        public ProjectParticipationsController(IProjectParticipationService participationService)
        {
            _participationService = participationService;
        }

        [HttpGet("test")]
        public IActionResult TestEndpoint()
        {
            return Ok(new { message = "Endpoint de teste funcionando!" });
        }
        
        [HttpPost("test/{id}")]
        public IActionResult TestPostEndpoint(int id, [FromBody] object data)
        {
            return Ok(new { message = $"Recebido POST para id {id}", data });
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserParticipations(int userId)
        {
            // Verificar se o usuário está acessando suas próprias participações
            var currentUserId = GetCurrentUserId();
            if (userId != currentUserId)
            {
                return Forbid();
            }

            var participations = await _participationService.GetUserParticipationsAsync(userId);
            return Ok(participations);
        }

        [HttpGet("project/{projectId}")]
        public async Task<IActionResult> GetProjectParticipants(int projectId)
        {
            var participants = await _participationService.GetProjectParticipantsAsync(projectId);
            return Ok(participants);
        }

        [HttpPost]
        public async Task<IActionResult> AddParticipation([FromBody] ProjectParticipationRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Garantir que o usuário só possa adicionar a si mesmo como participante
            var currentUserId = GetCurrentUserId();
            request.UserId = currentUserId;

            try
            {
                var result = await _participationService.AddParticipationAsync(request);
                return CreatedAtAction(nameof(GetUserParticipations), new { userId = result.UserId }, result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }
        
        [HttpPost("join/{projectId}")]
        public async Task<IActionResult> JoinProject(int projectId, [FromBody] dynamic payload)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Console.WriteLine($"Recebido payload para join: {payload}");
            var currentUserId = GetCurrentUserId();
            
            try
            {
                var request = new ProjectParticipationRequestDto
                {
                    ProjectId = projectId,
                    UserId = currentUserId // Usamos o ID do usuário autenticado por segurança
                };
                
                var result = await _participationService.AddParticipationAsync(request);
                return CreatedAtAction(nameof(GetUserParticipations), new { userId = result.UserId }, result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpDelete("project/{projectId}")]
        public async Task<IActionResult> RemoveParticipation(int projectId)
        {
            var userId = GetCurrentUserId();
            
            try
            {
                var result = await _participationService.RemoveParticipationAsync(projectId, userId);
                if (!result)
                {
                    return NotFound("Participação não encontrada.");
                }
                
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }
        
        [HttpDelete("leave/{projectId}")]
        public async Task<IActionResult> LeaveProject(int projectId)
        {
            var userId = GetCurrentUserId();
            
            try
            {
                var result = await _participationService.RemoveParticipationAsync(projectId, userId);
                if (!result)
                {
                    return NotFound("Participação não encontrada.");
                }
                
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }
        
        [HttpDelete("leave/{projectId}/{userId}")]
        public async Task<IActionResult> RemoveUserFromProject(int projectId, int userId)
        {
            var currentUserId = GetCurrentUserId();
            
            // Verificar se o usuário atual é o dono do projeto
            bool isProjectOwner = await _participationService.IsUserProjectOwnerAsync(projectId, currentUserId);
            
            if (!isProjectOwner && currentUserId != userId)
            {
                return Forbid();
            }
            
            try
            {
                var result = await _participationService.RemoveParticipationAsync(projectId, userId);
                if (!result)
                {
                    return NotFound("Participação não encontrada.");
                }
                
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("opportunities")]
        public async Task<IActionResult> GetOpportunities()
        {
            var opportunities = await _participationService.GetPublicProjectsWithVacanciesAsync();
            return Ok(opportunities);
        }

        [HttpGet("public/{projectId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublicProjectParticipants(int projectId)
        {
            var participants = await _participationService.GetProjectParticipantsAsync(projectId);
            return Ok(participants);
        }

        [HttpPost("simpleJoin")]
        public async Task<IActionResult> SimpleJoinProject([FromBody] SimpleJoinDto data)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var currentUserId = GetCurrentUserId();
            
            try
            {
                var request = new ProjectParticipationRequestDto
                {
                    ProjectId = data.ProjectId,
                    UserId = currentUserId
                };
                
                var result = await _participationService.AddParticipationAsync(request);
                return CreatedAtAction(nameof(GetUserParticipations), new { userId = result.UserId }, result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
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