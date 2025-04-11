using System.Threading;
using System.Threading.Tasks;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Contracts.Interfaces
{
    public interface IApplicationDbContext
    {
        DbSet<User> Users { get; set; }
        DbSet<Project> Projects { get; set; }
        DbSet<ProjectParticipation> ProjectParticipations { get; set; }
        
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
} 