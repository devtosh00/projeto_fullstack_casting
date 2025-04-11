using System;

namespace Application.DTOs
{
    public class ProjectCreationDto
    {
        public int UserId { get; set; }
        public required string Description { get; set; }
        public decimal Budget { get; set; }
        public DateTime Deadline { get; set; }
        public required string Status { get; set; }
        
        // Propriedades relacionadas a projetos públicos
        public bool IsPublic { get; set; } = false;
        public int MaxParticipants { get; set; } = 1;
        public bool HasVacancies { get; set; } = false;
    }
} 