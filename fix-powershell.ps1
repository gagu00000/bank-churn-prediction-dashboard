# Fix PowerShell Conda Error

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FIXING POWERSHELL CONDA ERROR" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

$profilePath = $PROFILE.CurrentUserAllHosts

Write-Host "Your PowerShell profile: $profilePath`n" -ForegroundColor Cyan

if (Test-Path $profilePath) {
    Write-Host "Backing up current profile..." -ForegroundColor Yellow
    Copy-Item $profilePath "$profilePath.backup" -Force
    Write-Host "Backup saved to: $profilePath.backup`n" -ForegroundColor Green
    
    Write-Host "Fixing conda initialization..." -ForegroundColor Yellow
    
    # Read the profile
    $content = Get-Content $profilePath -Raw
    
    # Comment out conda lines
    $content = $content -replace '(?m)^(\s*\(.*conda.*\))', '# $1'
    $content = $content -replace '(?m)^(\s*conda activate)', '# $1'
    
    # Save it
    Set-Content $profilePath $content
    
    Write-Host "Fixed!`n" -ForegroundColor Green
    Write-Host "To activate conda when needed, manually run:" -ForegroundColor Cyan
    Write-Host "  conda activate base`n" -ForegroundColor White
} else {
    Write-Host "No PowerShell profile found. This is fine!`n" -ForegroundColor Green
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PLEASE RESTART POWERSHELL NOW" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan
Write-Host "Close this PowerShell window and open a new one.`n" -ForegroundColor White

pause
