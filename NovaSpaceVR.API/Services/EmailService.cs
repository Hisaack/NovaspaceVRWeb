using Azure.Communication.Email;

namespace NovaSpaceVR.API.Services;

public class EmailService : IEmailService
{
    private readonly EmailClient _emailClient;
    private readonly string _senderEmail;

    public EmailService(IConfiguration configuration)
    {
        var connectionString = configuration["AzureCommunicationServices:ConnectionString"];
        _senderEmail = configuration["AzureCommunicationServices:SenderEmail"]!;
        _emailClient = new EmailClient(connectionString);
    }

    public async Task<bool> SendOtpEmailAsync(string email, string otpCode, string subject)
    {
        try
        {
            var htmlContent = $@"
                <html>
                <body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>
                    <div style='text-align: center; margin-bottom: 30px;'>
                        <h1 style='color: #8b5cf6;'>Nova Space VR Training System</h1>
                    </div>
                    
                    <div style='background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;'>
                        <h2 style='color: #333; margin-bottom: 20px;'>{subject}</h2>
                        <p style='color: #666; font-size: 16px; margin-bottom: 30px;'>
                            Your verification code is:
                        </p>
                        <div style='background-color: #8b5cf6; color: white; font-size: 32px; font-weight: bold; padding: 20px; border-radius: 8px; letter-spacing: 8px; margin: 20px 0;'>
                            {otpCode}
                        </div>
                        <p style='color: #666; font-size: 14px;'>
                            This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
                        </p>
                    </div>
                    
                    <div style='text-align: center; margin-top: 30px; color: #999; font-size: 12px;'>
                        <p>© 2024 Nova Space VR Training System. All rights reserved.</p>
                    </div>
                </body>
                </html>";

            var emailMessage = new EmailMessage(
                senderAddress: _senderEmail,
                content: new EmailContent(subject)
                {
                    Html = htmlContent
                },
                recipients: new EmailRecipients(new List<EmailAddress> { new(email) }));

            var operation = await _emailClient.SendAsync(Azure.WaitUntil.Completed, emailMessage);
            if (operation.HasCompleted)
            {
                var result = operation.Value;
                return result.Status == EmailSendStatus.Succeeded;
            }
            return false;
        }
        catch (Exception ex)
        {
            // Log the exception
            Console.WriteLine($"Failed to send email: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> SendCertificateEmailAsync(string email, string userName, string courseName, byte[] certificatePdf)
    {
        try
        {
            var htmlContent = $@"
                <html>
                <body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>
                    <div style='text-align: center; margin-bottom: 30px;'>
                        <h1 style='color: #8b5cf6;'>Nova Space VR Training System</h1>
                    </div>
                    
                    <div style='background-color: #f8f9fa; padding: 30px; border-radius: 10px;'>
                        <h2 style='color: #333; margin-bottom: 20px;'>🎓 Congratulations on Your Achievement!</h2>
                        <p style='color: #666; font-size: 16px; margin-bottom: 20px;'>
                            Dear {userName},
                        </p>
                        <p style='color: #666; font-size: 16px; margin-bottom: 20px;'>
                            Congratulations! You have successfully completed the <strong>{courseName}</strong> course.
                        </p>
                        <p style='color: #666; font-size: 16px; margin-bottom: 20px;'>
                            Your certificate is attached to this email. You can download and print it for your records.
                        </p>
                        <div style='background-color: #e7f3ff; padding: 20px; border-radius: 8px; border-left: 4px solid #8b5cf6;'>
                            <p style='color: #333; font-weight: bold; margin: 0;'>
                                🏆 Course Completed: {courseName}
                            </p>
                        </div>
                    </div>
                    
                    <div style='text-align: center; margin-top: 30px; color: #999; font-size: 12px;'>
                        <p>© 2024 Nova Space VR Training System. All rights reserved.</p>
                    </div>
                </body>
                </html>";

            var emailMessage = new EmailMessage(
                senderAddress: _senderEmail,
                content: new EmailContent("🎓 Your Course Completion Certificate")
                {
                    Html = htmlContent
                },
                recipients: new EmailRecipients(new List<EmailAddress> { new(email) }));

            // Add certificate attachment
            var attachment = new EmailAttachment(
                name: $"Certificate_{userName.Replace(" ", "_")}_{courseName.Replace(" ", "_")}.pdf",
                contentType: "application/pdf",
                content: new BinaryData(certificatePdf));

            emailMessage.Attachments.Add(attachment);

            var operation = await _emailClient.SendAsync(Azure.WaitUntil.Completed, emailMessage);
            if (operation.HasCompleted)
            {
                var result = operation.Value;
                return result.Status == EmailSendStatus.Succeeded;
            }
            return false;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to send certificate email: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> SendWelcomeEmailAsync(string email, string userName)
    {
        try
        {
            var htmlContent = $@"
                <html>
                <body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>
                    <div style='text-align: center; margin-bottom: 30px;'>
                        <h1 style='color: #8b5cf6;'>Nova Space VR Training System</h1>
                    </div>
                    
                    <div style='background-color: #f8f9fa; padding: 30px; border-radius: 10px;'>
                        <h2 style='color: #333; margin-bottom: 20px;'>Welcome to Nova Space!</h2>
                        <p style='color: #666; font-size: 16px; margin-bottom: 20px;'>
                            Dear {userName},
                        </p>
                        <p style='color: #666; font-size: 16px; margin-bottom: 20px;'>
                            Welcome to the Nova Space VR Training System! Your account has been successfully created.
                        </p>
                        <p style='color: #666; font-size: 16px; margin-bottom: 20px;'>
                            You can now access our comprehensive VR training courses and start your learning journey.
                        </p>
                    </div>
                    
                    <div style='text-align: center; margin-top: 30px; color: #999; font-size: 12px;'>
                        <p>© 2024 Nova Space VR Training System. All rights reserved.</p>
                    </div>
                </body>
                </html>";

            var emailMessage = new EmailMessage(
                senderAddress: _senderEmail,
                content: new EmailContent("Welcome to Nova Space VR Training System")
                {
                    Html = htmlContent
                },
                recipients: new EmailRecipients(new List<EmailAddress> { new(email) }));

            var operation = await _emailClient.SendAsync(Azure.WaitUntil.Completed, emailMessage);
            if (operation.HasCompleted)
            {
                var result = operation.Value;
                return result.Status == EmailSendStatus.Succeeded;
            }
            return false;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to send welcome email: {ex.Message}");
            return false;
        }
    }
}