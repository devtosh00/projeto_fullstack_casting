using System;
using System.Collections.Generic;

namespace Domain.Entities
{
    public class Project
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public required string Description { get; set; }
        public decimal Budget { get; set; }
        public DateTime Deadline { get; set; }
        public required string Status { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Novos campos para funcionalidade de oportunidades
        public bool IsPublic { get; set; } = false;
        public int MaxParticipants { get; set; } = 1;
        public bool HasVacancies { get; set; } = false;
        
        // Navegação para o usuário (anulável)
        public User? User { get; set; }
        
        // Navegação para participantes do projeto
        public ICollection<ProjectParticipation>? Participations { get; set; }
    }
} 