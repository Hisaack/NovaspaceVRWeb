using NovaSpaceVR.API.DTOs;

namespace NovaSpaceVR.API.Services;

public interface ITrainingService
{
    Task<IEnumerable<TrainingDataDto>> GetAllTrainingDataAsync();
    Task<IEnumerable<TrainingDataDto>> GetTrainingDataByAccountAsync(string accountId);
    Task<TrainingDataDto?> GetTrainingDataByIdAsync(string id);
    Task<TrainingStepsDto?> GetTrainingStepsAsync(string trainingId);
    Task<IEnumerable<GraduatedUserDto>> GetGraduatedUsersAsync();
    Task<IEnumerable<GraduatedUserDto>> GetGraduatedUsersByAccountAsync(string accountId);
    Task<GraduatedUserDto> CreateGraduatedUserAsync(CreateGraduatedUserDto createGraduatedUserDto);
}