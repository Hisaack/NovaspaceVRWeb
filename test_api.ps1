# Test API endpoints
$baseUrl = "https://localhost:57624/api"

# Ignore SSL certificate errors
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}

# Test login
$loginBody = @{
    email = "admin@techcorp.com"
    password = "Admin123!"
} | ConvertTo-Json

Write-Host "Testing login..." -ForegroundColor Yellow

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "Login successful!" -ForegroundColor Green
    Write-Host "Token: $($loginResponse.token.Substring(0, 50))..." -ForegroundColor Cyan
    
    # Test courses endpoint with token
    $headers = @{
        "Authorization" = "Bearer $($loginResponse.token)"
        "Content-Type" = "application/json"
    }
    
    Write-Host "Testing courses endpoint..." -ForegroundColor Yellow
    $coursesResponse = Invoke-RestMethod -Uri "$baseUrl/courses" -Method GET -Headers $headers
    Write-Host "Courses retrieved successfully!" -ForegroundColor Green
    Write-Host "Number of courses: $($coursesResponse.Length)" -ForegroundColor Cyan
    
} catch {
    Write-Host "Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody" -ForegroundColor Red
    }
}
