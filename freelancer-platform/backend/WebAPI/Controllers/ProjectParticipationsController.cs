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

        [HttpGet("opportunities")]
        public async Task<IActionResult> GetOpportunities()
        {
            var opportunities = await _participationService.GetPublicProjectsWithVacanciesAsync();
            return Ok(opportunities);
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