using AutoMapper;
using NovaSpaceVR.API.DTOs;
using NovaSpaceVR.API.Models;

namespace NovaSpaceVR.API.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // User mappings
        CreateMap<ApplicationUser, UserDto>();
        CreateMap<ApplicationUser, AccountDto>()
            .ForMember(dest => dest.EmailConfirmed, opt => opt.MapFrom(src => src.EmailConfirmed));
        CreateMap<UpdateAccountDto, ApplicationUser>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        // Course mappings
        CreateMap<Course, CourseDto>()
            .ForMember(dest => dest.Enrolled, opt => opt.MapFrom(src => src.Enrollments.Count));
        CreateMap<CreateCourseDto, Course>();
        CreateMap<UpdateCourseDto, Course>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        // Course Module mappings
        CreateMap<CourseModule, CourseModuleDto>();
        CreateMap<CreateModuleDto, CourseModule>();
        CreateMap<UpdateModuleDto, CourseModule>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        // Virtual User mappings
        CreateMap<VirtualUser, VirtualUserDto>()
            .ForMember(dest => dest.OrganizationName, opt => opt.MapFrom(src => src.Account.OrganizationName));
        CreateMap<CreateVirtualUserDto, VirtualUser>();
        CreateMap<UpdateVirtualUserDto, VirtualUser>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        // Training Data mappings
        CreateMap<TrainingData, TrainingDataDto>()
            .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.VirtualUser.Name))
            .ForMember(dest => dest.UserCode, opt => opt.MapFrom(src => src.VirtualUser.UserCode))
            .ForMember(dest => dest.CourseCode, opt => opt.MapFrom(src => src.Course.Code));

        // Graduated User mappings
        CreateMap<GraduatedUser, GraduatedUserDto>()
            .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.VirtualUser.Name))
            .ForMember(dest => dest.UserCode, opt => opt.MapFrom(src => src.VirtualUser.UserCode))
            .ForMember(dest => dest.CourseName, opt => opt.MapFrom(src => src.Course.Title));
        CreateMap<CreateGraduatedUserDto, GraduatedUser>();

        // Device mappings
        CreateMap<Device, DeviceDto>();
        CreateMap<UpdateDeviceDto, Device>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        // Alert mappings
        CreateMap<Alert, AlertDto>();
        CreateMap<CreateAlertDto, Alert>();

        // Enrollment mappings
        CreateMap<Enrollment, EnrollmentDto>()
            .ForMember(dest => dest.VirtualUserName, opt => opt.MapFrom(src => src.VirtualUser.Name))
            .ForMember(dest => dest.CourseTitle, opt => opt.MapFrom(src => src.Course.Title))
            .ForMember(dest => dest.UserCode, opt => opt.MapFrom(src => src.VirtualUser.UserCode));
        CreateMap<CreateEnrollmentDto, Enrollment>();
        CreateMap<UpdateEnrollmentDto, Enrollment>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
    }
}