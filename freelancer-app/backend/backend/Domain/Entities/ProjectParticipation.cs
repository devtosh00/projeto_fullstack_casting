using System;

namespace Domain.Entities
{
    public class ProjectParticipation
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public int UserId { get; set; }
        public string Role { get; set; } = "participant"; // Exemplo: owner, participant, etc.
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
        
        // Navegação
        public Project? Project { get; set; }
        public User? User { get; set; }
    }
} 