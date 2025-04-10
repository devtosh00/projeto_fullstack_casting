using System;

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
        
        // Navegação para o usuário (anulável)
        public User? User { get; set; }
    }
} 