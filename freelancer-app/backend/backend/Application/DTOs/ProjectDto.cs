using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class ProjectCreationDto
    {
        public int UserId { get; set; }
        public required string Description { get; set; }
        public decimal Budget { get; set; }
        public DateTime Deadline { get; set; }
        public required string Status { get; set; }
        
        // Novos campos
        public bool IsPublic { get; set; } = false;
        public int MaxParticipants { get; set; } = 1;
        public bool HasVacancies { get; set; } = false;
    }

    public class ProjectDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public required string Description { get; set; }
        public decimal Budget { get; set; }
        public DateTime Deadline { get; set; }
        public required string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        
        // Novos campos
        public bool IsPublic { get; set; } = false;
        public int MaxParticipants { get; set; } = 1;
        public bool HasVacancies { get; set; } = false;
        public int CurrentParticipants { get; set; } = 1; // Incluindo o criador
        
        // Lista de participantes (opcional, pois pode ser muito grande)
        public List<ParticipantDto>? Participants { get; set; }
    }
    
    public class ProjectParticipationDto
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public int UserId { get; set; }
        public string Role { get; set; } = "";
        public DateTime JoinedAt { get; set; }
        
        // Informações relacionadas
        public string? Username { get; set; }
        public string? ProjectDescription { get; set; }
    }
    
    public class ParticipantDto
    {
        public int UserId { get; set; }
        public string Username { get; set; } = "";
        public string Role { get; set; } = "";
        public DateTime JoinedAt { get; set; }
    }
    
    public class ProjectParticipationRequestDto
    {
        public int ProjectId { get; set; }
        public int UserId { get; set; }
    }
} 