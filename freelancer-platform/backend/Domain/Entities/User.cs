using System;

namespace Domain.Entities
{
    public class User
    {
        public int Id { get; set; }
        public required string Username { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navegação para projetos
        public ICollection<Project> Projects { get; set; } = new List<Project>();
    }
} 