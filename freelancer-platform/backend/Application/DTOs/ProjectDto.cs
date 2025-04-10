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
    }
} 