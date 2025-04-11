using System;
using System.Collections.Generic;

namespace Domain.Entities
{
    public class User
    {
        public int Id { get; set; }
        public required string Username { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navegação para projetos que o usuário criou
        public ICollection<Project> Projects { get; set; } = new List<Project>();
        
        // Navegação para participações em projetos
        public ICollection<ProjectParticipation> Participations { get; set; } = new List<ProjectParticipation>();
    }
} 