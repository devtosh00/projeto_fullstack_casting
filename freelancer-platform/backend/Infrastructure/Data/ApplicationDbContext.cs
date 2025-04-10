using Domain.Entities;
using Contracts.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data
{
    public class ApplicationDbContext : DbContext, IApplicationDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Project> Projects { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Password).IsRequired();
                entity.Property(e => e.CreatedAt).IsRequired();

                // Unique constraints e índices
                entity.HasIndex(e => e.Username).IsUnique().HasFilter(null);
                entity.HasIndex(e => e.Email).IsUnique().HasFilter(null);
                
                // Índice de performance para consultas de criação
                entity.HasIndex(e => e.CreatedAt);
            });

            // Project
            modelBuilder.Entity<Project>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Description).IsRequired();
                entity.Property(e => e.Budget).IsRequired().HasColumnType("decimal(18,2)");
                entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
                entity.Property(e => e.CreatedAt).IsRequired();
                
                // Índices para campos frequentemente consultados
                entity.HasIndex(e => e.UserId);  // Índice para FK
                entity.HasIndex(e => e.Status);  // Filtros por status são comuns
                entity.HasIndex(e => e.Deadline); // Filtros por prazo são comuns
                
                // Índice composto para consultas comuns
                entity.HasIndex(e => new { e.UserId, e.Status });

                // Foreign key constraint
                entity.HasOne(e => e.User)
                      .WithMany(u => u.Projects)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Budget validation - usando a nova sintaxe
                entity.ToTable(tb => tb.HasCheckConstraint("CK_Project_Budget_Min", "\"Budget\" >= 100"));
            });
        }
        
        // Otimização para consultas no EF Core
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);
            
            // Otimização de queries
            optionsBuilder.EnableSensitiveDataLogging(false);
            optionsBuilder.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);
        }
    }
} 