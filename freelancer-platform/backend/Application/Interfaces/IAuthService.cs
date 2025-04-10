using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(UserRegistrationDto userDto);
        Task<AuthResponseDto> LoginAsync(UserLoginDto loginDto);
    }
} 