using Microsoft.AspNetCore.Identity;
using NovaSpaceVR.API.Models;
using Microsoft.EntityFrameworkCore;

namespace NovaSpaceVR.API.Data;

public static class DataSeeder
{
    static string globalManufId = "1";
    static string innovationId = "2";
    static string betaId = "3";
    static string futureId = "4";
    public static async Task SeedAsync(ApplicationDbContext context, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
    {
        // Ensure database is created
        await context.Database.EnsureCreatedAsync();

        // Seed Roles
        if (!await roleManager.RoleExistsAsync("Admin"))
        {
            await roleManager.CreateAsync(new IdentityRole("Admin"));
        }

        if (!await roleManager.RoleExistsAsync("User"))
        {
            await roleManager.CreateAsync(new IdentityRole("User"));
        }

        if (!await roleManager.RoleExistsAsync("VirtualUser"))
        {
            await roleManager.CreateAsync(new IdentityRole("VirtualUser"));
        }

        // Seed Admin User (TechCorp Industries)
        var adminEmail = "admin@techcorp.com";
        var adminUser = await userManager.FindByEmailAsync(adminEmail);
       

        if (adminUser == null)
        {
            adminUser = new ApplicationUser
            {
                UserName = "techcorp_admin",
                Email = adminEmail,
                EmailConfirmed = true,
                FirstName = "John",
                LastName = "Smith",
                OrganizationName = "TechCorp Industries",
                TwoFactorEnabled = false,
                IsAccountGeneralPublic = false,
                CapacityPool = 50,
                CreatedDate = DateTime.UtcNow,
                DeviceId = "DEV-TC-001",
                IsActive = true
            };

            var result = await userManager.CreateAsync(adminUser, "Admin123!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, "Admin");
            }
        }

        // Seed other test accounts
        await SeedTestAccounts(context, userManager);
        
        // Seed courses
        await SeedCourses(context, adminUser.Id);
        
        // Seed virtual users
        await SeedVirtualUsers(context, adminUser.Id);
        
        // Seed devices
        await SeedDevices(context);
        
        await context.SaveChangesAsync();
    }

    private static async Task SeedTrainingData(ApplicationDbContext context)
    {
        if (!context.TrainingData.Any())
        {
            var virtualUsers = await context.VirtualUsers.ToListAsync();
            var courses = await context.Courses.ToListAsync();

            var trainingData = new List<TrainingData>();

            foreach (var user in virtualUsers) // Create training data for all users
            {
                // Create 1-3 training records per user
                var trainingCount = new Random().Next(1, 4);
                var userCourses = courses.OrderBy(x => Guid.NewGuid()).Take(trainingCount);
                
                foreach (var course in userCourses)
                {
                    var training = new TrainingData
                    {
                        VirtualUserId = user.Id,
                        CourseId = course.Id,
                        AccountId = user.AccountId,
                        TrainedTime = $"{new Random().Next(1, 5)}h {new Random().Next(0, 60)}m",
                        ElapsedTime = $"{new Random().Next(2, 6)}h {new Random().Next(0, 60)}m",
                        AccumulatedSample = new Random().Next(70, 100),
                        TrainingDate = DateTime.UtcNow.AddDays(-new Random().Next(1, 60)),
                        IsCompleted = new Random().Next(0, 2) == 1
                    };
                    trainingData.Add(training);
                }
            }

            context.TrainingData.AddRange(trainingData);
            await context.SaveChangesAsync();

            // Seed Training Steps for each training data
            foreach (var training in trainingData)
            {
                var steps = new List<TrainingStep>();
                var stepCount = new Random().Next(3, 8); // 3-7 steps per training
                for (int i = 1; i <= stepCount; i++)
                {
                    var errorRate = Math.Max(5, 30 - (i * 5) + new Random().Next(-5, 6));
                    steps.Add(new TrainingStep
                    {
                        TrainingDataId = training.Id,
                        AccountId = training.AccountId,
                        StepNumber = i,
                        ElapsedTime = 15 + (i * 3) + new Random().Next(-3, 4),
                        ExpectedTime = 12 + (i * 3),
                        ErrorSum = new Random().Next(1, 6),
                        ErrorRate = errorRate,
                        ErrorSummary = GetErrorSummary(i),
                        SuccessRate = 100 - errorRate
                    });
                }
                context.TrainingSteps.AddRange(steps);
            }
            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedGraduatedUsers(ApplicationDbContext context)
    {
        if (!context.GraduatedUsers.Any())
        {
            var virtualUsers = await context.VirtualUsers.ToListAsync();
            var courses = await context.Courses.ToListAsync();

            var graduatedUsers = new List<GraduatedUser>();

            // Graduate 30-40% of users
            var graduateCount = (int)(virtualUsers.Count * 0.35);
            var usersToGraduate = virtualUsers.OrderBy(x => Guid.NewGuid()).Take(graduateCount);
            
            foreach (var user in usersToGraduate)
            {
                // Graduate from 1-2 courses per user
                var courseCount = new Random().Next(1, 3);
                var userCourses = courses.OrderBy(x => Guid.NewGuid()).Take(courseCount);
                
                foreach (var course in userCourses)
                {
                    graduatedUsers.Add(new GraduatedUser
                    {
                        VirtualUserId = user.Id,
                        CourseId = course.Id,
                        CertificateId = $"CERT{DateTimeOffset.UtcNow.ToUnixTimeSeconds() + new Random().Next(1000, 9999)}",
                        DateIssued = DateTime.UtcNow.AddDays(-new Random().Next(1, 90)),
                        CertificateSent = new Random().Next(0, 2) == 1
                    });
                }
            }

            context.GraduatedUsers.AddRange(graduatedUsers);
            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedEnrollments(ApplicationDbContext context)
    {
        if (!context.Enrollments.Any())
        {
            var virtualUsers = await context.VirtualUsers.ToListAsync();
            var courses = await context.Courses.ToListAsync();

            var enrollments = new List<Enrollment>();

            foreach (var user in virtualUsers)
            {
                // Enroll each user in 2-5 random courses
                var coursesToEnroll = courses.OrderBy(x => Guid.NewGuid()).Take(new Random().Next(2, 6));
                
                foreach (var course in coursesToEnroll)
                {
                    enrollments.Add(new Enrollment
                    {
                        VirtualUserId = user.Id,
                        CourseId = course.Id,
                        AccountId = user.AccountId,
                        EnrollmentDate = DateTime.UtcNow.AddDays(-new Random().Next(1, 90)),
                        Progress = new Random().Next(20, 101),
                        Status = new Random().Next(0, 2) == 1 ? "Completed" : "In Progress"
                    });
                }
            }

            context.Enrollments.AddRange(enrollments);
            await context.SaveChangesAsync();
        }
    }

    private static string GetErrorSummary(int step)
    {
        var summaries = new[]
        {
            "Navigation errors",
            "Interaction delays", 
            "Minor hesitations",
            "Timing adjustment",
            "Final optimization"
        };
        return summaries[Math.Min(step - 1, summaries.Length - 1)];
    }

    private static async Task SeedTestAccounts(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
    {
        var testAccounts = new[]
        {
            new { Email = "admin@globalmanuf.com", UserName = "global_admin", OrgName = "Global Manufacturing Inc", IsPublic = false, Capacity = 75 },
            new { Email = "admin@innovationlabs.com", UserName = "innovation_admin", OrgName = "Innovation Labs", IsPublic = true, Capacity = 30 },
            new { Email = "admin@betatesting.com", UserName = "beta_admin", OrgName = "Beta Testing Corp", IsPublic = false, Capacity = 25 },
            new { Email = "admin@futuretech.com", UserName = "future_admin", OrgName = "Future Tech Solutions", IsPublic = true, Capacity = 100 }
        };

        foreach (var account in testAccounts)
        {
            var existingUser = await userManager.FindByEmailAsync(account.Email);
            if (existingUser == null)
            {
                var user = new ApplicationUser
                {
                    UserName = account.UserName,
                    Email = account.Email,
                    EmailConfirmed = true,
                    FirstName = "Admin",
                    LastName = "User",
                    OrganizationName = account.OrgName,
                    TwoFactorEnabled = false,
                    IsAccountGeneralPublic = account.IsPublic,
                    CapacityPool = account.Capacity,
                    CreatedDate = DateTime.UtcNow,
                    IsActive = true
                };

                var result = await userManager.CreateAsync(user, "User123!");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(user, "User");
                }
            }
        }
    }

    private static async Task SeedCourses(ApplicationDbContext context, string adminUserId)
    {
        if (!context.Courses.Any())
        {
            var courses = new[]
            {
                new Course
                {
                    Id = "P001",
                    Code = "P001",
                    Title = "Automotive Engineering",
                    Description = "Complete automotive engineering course covering all major vehicle systems, diagnostics, and modern automotive technology.",
                    Image = "/MobiusBackGround.jpg",
                    TargetSample = 150,
                    TargetTime = "8 hours",
                    NumberOfModules = 10,
                    IsPublic = true,
                    OrganizationId = null
                },
                new Course
                {
                    Id = "P002",
                    Code = "P002",
                    Title = "Electrical Engineering",
                    Description = "Comprehensive electrical engineering training covering circuit analysis, power systems, and modern electrical technologies.",
                    Image = "/ElectricalEng.jpg",
                    TargetSample = 180,
                    TargetTime = "10 hours",
                    NumberOfModules = 10,
                    IsPublic = true,
                    OrganizationId = null
                },
                new Course
                {
                    Id = "P003",
                    Code = "P003",
                    Title = "Mechanical Engineering",
                    Description = "Advanced mechanical engineering course covering thermodynamics, materials science, and manufacturing processes.",
                    Image = "/mechanics.jpg",
                    TargetSample = 200,
                    TargetTime = "9 hours",
                    NumberOfModules = 10,
                    IsPublic = true,
                    OrganizationId = null
                },
                new Course
                {
                    Id = "P004",
                    Code = "P004",
                    Title = "Plumbing Course",
                    Description = "Professional plumbing training covering all aspects of residential and commercial plumbing systems.",
                    Image = "/plumbing.jpg",
                    TargetSample = 120,
                    TargetTime = "6 hours",
                    NumberOfModules = 10,
                    IsPublic = true,
                    OrganizationId = null
                },
                new Course
                {
                    Id = "P005",
                    Code = "P005",
                    Title = "TechCorp Safety Training",
                    Description = "Organization-specific safety training protocols and procedures for TechCorp Industries employees.",
                    Image = "/MobiusBackGround.jpg",
                    TargetSample = 50,
                    TargetTime = "3 hours",
                    NumberOfModules = 5,
                    IsPublic = false,
                    OrganizationId = adminUserId
                }
            };

            context.Courses.AddRange(courses);
        }
    }

    private static async Task SeedVirtualUsers(ApplicationDbContext context, string adminUserId)
    {
        if (!context.VirtualUsers.Any())
        {
            var users = await context.Users.ToListAsync();
            var techCorpUser = users.FirstOrDefault(u => u.Email == "admin@techcorp.com");
            var globalManufUser = users.FirstOrDefault(u => u.Email == "admin@globalmanuf.com");
            var innovationUser = users.FirstOrDefault(u => u.Email == "admin@innovationlabs.com");
            var betaUser = users.FirstOrDefault(u => u.Email == "admin@betatesting.com");
            var futureUser = users.FirstOrDefault(u => u.Email == "admin@futuretech.com");

            var virtualUsers = new List<VirtualUser>();
            
            // TechCorp Industries users (15 users)
            var techCorpUsers = new[]
            {
                new VirtualUser
                {
                    Name = "John Doe",
                    UserCode = "A123",
                    Email = "john@example.com",
                    AccountId = techCorpUser?.Id ?? adminUserId,
                    Stage = "Beginner",
                    DateAdded = DateTime.UtcNow.AddDays(-30),
                    CoursesCompleted = 3,
                    TotalTrainingTime = "12h 30m",
                    AverageScore = 85,
                    IsActive = true
                },
                new VirtualUser
                {
                    Name = "Jane Smith",
                    UserCode = "B456",
                    Email = "jane@example.com",
                    AccountId = techCorpUser?.Id ?? adminUserId,
                    Stage = "Intermediate",
                    DateAdded = DateTime.UtcNow.AddDays(-25),
                    CoursesCompleted = 7,
                    TotalTrainingTime = "28h 45m",
                    AverageScore = 92,
                    IsActive = true
                },
                new VirtualUser
                {
                    Name = "Michael Johnson",
                    UserCode = "TC001",
                    Email = "michael.johnson@techcorp.com",
                    AccountId = techCorpUser?.Id ?? adminUserId,
                    Stage = "Advanced",
                    DateAdded = DateTime.UtcNow.AddDays(-45),
                    CoursesCompleted = 12,
                    TotalTrainingTime = "45h 20m",
                    AverageScore = 94,
                    IsActive = true
                },
                new VirtualUser
                {
                    Name = "Sarah Williams",
                    UserCode = "TC002",
                    Email = "sarah.williams@techcorp.com",
                    AccountId = techCorpUser?.Id ?? adminUserId,
                    Stage = "Intermediate",
                    DateAdded = DateTime.UtcNow.AddDays(-20),
                    CoursesCompleted = 5,
                    TotalTrainingTime = "22h 15m",
                    AverageScore = 88,
                    IsActive = true
                },
                new VirtualUser
                {
                    Name = "David Brown",
                    UserCode = "TC003",
                    Email = "david.brown@techcorp.com",
                    AccountId = techCorpUser?.Id ?? adminUserId,
                    Stage = "Beginner",
                    DateAdded = DateTime.UtcNow.AddDays(-15),
                    CoursesCompleted = 2,
                    TotalTrainingTime = "8h 30m",
                    AverageScore = 76,
                    IsActive = true
                }
            };
            virtualUsers.AddRange(techCorpUsers);
            
            // Global Manufacturing Inc users (12 users)
            var globalManufUsers = new[]
            {
                new VirtualUser
                {
                    Name = "Robert Miller",
                    UserCode = "C789",
                    Email = "mike@globalmanuf.com",
                    AccountId = globalManufUser?.Id ?? adminUserId,
                    Stage = "Advanced",
                    DateAdded = DateTime.UtcNow.AddDays(-20),
                    CoursesCompleted = 12,
                    TotalTrainingTime = "45h 20m",
                    AverageScore = 88,
                    IsActive = true
                },
                new VirtualUser
                {
                    Name = "Sarah Wilson",
                    UserCode = "D012",
                    Email = "sarah@globalmanuf.com",
                    AccountId = globalManufUser?.Id ?? adminUserId,
                    Stage = "Beginner",
                    DateAdded = DateTime.UtcNow.AddDays(-18),
                    CoursesCompleted = 2,
                    TotalTrainingTime = "8h 15m",
                    AverageScore = 78,
                    IsActive = true
                },
                new VirtualUser
                {
                    Name = "Jennifer Davis",
                    UserCode = "GM001",
                    Email = "jennifer.davis@globalmanuf.com",
                    AccountId = globalManufUser?.Id ?? adminUserId,
                    Stage = "Expert",
                    DateAdded = DateTime.UtcNow.AddDays(-60),
                    CoursesCompleted = 18,
                    TotalTrainingTime = "72h 45m",
                    AverageScore = 96,
                    IsActive = true
                },
                new VirtualUser
                {
                    Name = "Christopher Lee",
                    UserCode = "GM002",
                    Email = "christopher.lee@globalmanuf.com",
                    AccountId = globalManufUser?.Id ?? adminUserId,
                    Stage = "Intermediate",
                    DateAdded = DateTime.UtcNow.AddDays(-35),
                    CoursesCompleted = 8,
                    TotalTrainingTime = "31h 20m",
                    AverageScore = 89,
                    IsActive = true
                }
            };
            virtualUsers.AddRange(globalManufUsers);
            
            // Innovation Labs users (10 users)
            var innovationUsers = new[]
            {
                new VirtualUser
                {
                    Name = "David Brown",
                    UserCode = "E345",
                    Email = "david@innovationlabs.com",
                    AccountId = innovationUser?.Id ?? adminUserId,
                    Stage = "Intermediate",
                    DateAdded = DateTime.UtcNow.AddDays(-15),
                    CoursesCompleted = 5,
                    TotalTrainingTime = "22h 10m",
                    AverageScore = 89,
                    IsActive = true
                },
                new VirtualUser
                {
                    Name = "Lisa Garcia",
                    UserCode = "F678",
                    Email = "lisa@innovationlabs.com",
                    AccountId = innovationUser?.Id ?? adminUserId,
                    Stage = "Advanced",
                    DateAdded = DateTime.UtcNow.AddDays(-12),
                    CoursesCompleted = 15,
                    TotalTrainingTime = "52h 30m",
                    AverageScore = 94,
                    IsActive = true
                },
                new VirtualUser
                {
                    Name = "Amanda Rodriguez",
                    UserCode = "IL001",
                    Email = "amanda.rodriguez@innovationlabs.com",
                    AccountId = innovationUser?.Id ?? adminUserId,
                    Stage = "Expert",
                    DateAdded = DateTime.UtcNow.AddDays(-50),
                    CoursesCompleted = 20,
                    TotalTrainingTime = "85h 15m",
                    AverageScore = 97,
                    IsActive = true
                }
            };
            virtualUsers.AddRange(innovationUsers);
            
            // Beta Testing Corp users (8 users)
            var betaUsers = new[]
            {
                new VirtualUser
                {
                    Name = "Robert Lee",
                    UserCode = "G901",
                    Email = "robert@betatesting.com",
                    AccountId = betaUser?.Id ?? adminUserId,
                    Stage = "Beginner",
                    DateAdded = DateTime.UtcNow.AddDays(-10),
                    CoursesCompleted = 1,
                    TotalTrainingTime = "4h 45m",
                    AverageScore = 72,
                    IsActive = true
                },
                new VirtualUser
                {
                    Name = "Emily Davis",
                    UserCode = "H234",
                    Email = "emily@betatesting.com",
                    AccountId = betaUser?.Id ?? adminUserId,
                    Stage = "Intermediate",
                    DateAdded = DateTime.UtcNow.AddDays(-8),
                    CoursesCompleted = 8,
                    TotalTrainingTime = "35h 20m",
                    AverageScore = 91,
                    IsActive = true
                },
                new VirtualUser
                {
                    Name = "Kevin Thompson",
                    UserCode = "BT001",
                    Email = "kevin.thompson@betatesting.com",
                    AccountId = betaUser?.Id ?? adminUserId,
                    Stage = "Advanced",
                    DateAdded = DateTime.UtcNow.AddDays(-25),
                    CoursesCompleted = 11,
                    TotalTrainingTime = "42h 30m",
                    AverageScore = 87,
                    IsActive = true
                }
            };
            virtualUsers.AddRange(betaUsers);
            
            // Future Tech Solutions users (12 users)
            var futureUsers = new[]
            {
                new VirtualUser
                {
                    Name = "James Miller",
                    UserCode = "I567",
                    Email = "james@futuretech.com",
                    AccountId = futureUser?.Id ?? adminUserId,
                    Stage = "Advanced",
                    DateAdded = DateTime.UtcNow.AddDays(-6),
                    CoursesCompleted = 18,
                    TotalTrainingTime = "68h 15m",
                    AverageScore = 96,
                    IsActive = true
                },
                new VirtualUser
                {
                    Name = "Maria Rodriguez",
                    UserCode = "J890",
                    Email = "maria@futuretech.com",
                    AccountId = futureUser?.Id ?? adminUserId,
                    Stage = "Beginner",
                    DateAdded = DateTime.UtcNow.AddDays(-4),
                    CoursesCompleted = 3,
                    TotalTrainingTime = "11h 30m",
                    AverageScore = 80,
                    IsActive = true
                },
                new VirtualUser
                {
                    Name = "Daniel White",
                    UserCode = "FT001",
                    Email = "daniel.white@futuretech.com",
                    AccountId = futureUser?.Id ?? adminUserId,
                    Stage = "Expert",
                    DateAdded = DateTime.UtcNow.AddDays(-70),
                    CoursesCompleted = 25,
                    TotalTrainingTime = "95h 45m",
                    AverageScore = 98,
                    IsActive = true
                },
                new VirtualUser
                {
                    Name = "Nicole Anderson",
                    UserCode = "FT002",
                    Email = "nicole.anderson@futuretech.com",
                    AccountId = futureUser?.Id ?? adminUserId,
                    Stage = "Intermediate",
                    DateAdded = DateTime.UtcNow.AddDays(-40),
                    CoursesCompleted = 9,
                    TotalTrainingTime = "38h 20m",
                    AverageScore = 91,
                    IsActive = true
                }
            };
            virtualUsers.AddRange(futureUsers);

            context.VirtualUsers.AddRange(virtualUsers);
            await context.SaveChangesAsync();

            // Seed Training Data
            await SeedTrainingData(context);

            // Seed Graduated Users
            await SeedGraduatedUsers(context);

            // Seed Enrollments
            await SeedEnrollments(context);
        }
    }

    private static async Task SeedDevices(ApplicationDbContext context)
    {
        if (!context.Devices.Any())
        {
            var users = await context.Users.ToListAsync();
            var virtualUsers = await context.VirtualUsers.ToListAsync();
            
            var devices = new List<Device>();
            
            // Create devices for each account
            foreach (var user in users)
            {
                var accountVirtualUsers = virtualUsers.Where(vu => vu.AccountId == user.Id).ToList();
                var deviceCount = Math.Min(accountVirtualUsers.Count, new Random().Next(2, 6)); // 2-5 devices per account
                
                for (int i = 0; i < deviceCount; i++)
                {
                    var models = new[] { "Quest 3", "Quest 3S", "Quest 2", "Quest Pro" };
                    var countries = new[] { "United States", "Canada", "United Kingdom", "Germany", "France", "Japan", "Australia" };
                    var cities = new[] { "New York", "Toronto", "London", "Berlin", "Paris", "Tokyo", "Sydney", "Los Angeles", "Chicago", "Vancouver" };
                    var ramOptions = new[] { "6GB", "8GB", "12GB", "16GB" };
                    var storageOptions = new[] { "128GB", "256GB", "512GB", "1TB" };
                    
                    var selectedModel = models[new Random().Next(models.Length)];
                    var selectedCountry = countries[new Random().Next(countries.Length)];
                    var selectedCity = cities[new Random().Next(cities.Length)];
                    
                    var device = new Device
                    {
                        DeviceName = $"Meta {selectedModel}",
                        Brand = "Meta",
                        Model = selectedModel,
                        Country = selectedCountry,
                        City = selectedCity,
                        Ram = ramOptions[new Random().Next(ramOptions.Length)],
                        Storage = storageOptions[new Random().Next(storageOptions.Length)],
                        Status = new Random().Next(0, 10) > 1 ? "Active" : "Blocked", // 90% active, 10% blocked
                        OsVersion = $"Quest OS {new Random().Next(4, 6)}.{new Random().Next(0, 5)}.{new Random().Next(0, 10)}",
                        LastSeen = DateTime.UtcNow.AddHours(-new Random().Next(1, 72)),
                        UserId = i < accountVirtualUsers.Count ? accountVirtualUsers[i].UserCode : $"U{new Random().Next(1000, 9999)}",
                        AccountId = user.Id
                    };
                    
                    devices.Add(device);
                }
            }

            context.Devices.AddRange(devices);
        }
    }
}