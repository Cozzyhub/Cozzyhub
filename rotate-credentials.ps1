# PowerShell Script to Rotate Resend API Key
# Run this after you've generated a new API key from Resend dashboard

param(
    [Parameter(Mandatory=$true, HelpMessage="Enter your new Resend API key")]
    [string]$NewApiKey
)

Write-Host ""
Write-Host "🔐 Resend API Key Rotation Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Validate API key format
if ($NewApiKey -notmatch "^re_[a-zA-Z0-9_]+$") {
    Write-Host "❌ Error: Invalid API key format. Resend keys should start with 're_'" -ForegroundColor Red
    Write-Host "Example: re_AbCdEfGh123456789..." -ForegroundColor Yellow
    exit 1
}

# Check if .env.local exists
$envFile = ".env.local"
if (-not (Test-Path $envFile)) {
    Write-Host "❌ Error: .env.local file not found!" -ForegroundColor Red
    Write-Host "Please create .env.local from .env.example first." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found .env.local file" -ForegroundColor Green

# Backup the current .env.local
$backupFile = ".env.local.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item $envFile $backupFile
Write-Host "✅ Created backup: $backupFile" -ForegroundColor Green

# Read and update the file
$content = Get-Content $envFile -Raw
$oldKey = if ($content -match "RESEND_API_KEY=([^\r\n]+)") { $Matches[1] } else { "not found" }

Write-Host ""
Write-Host "Old API Key: $($oldKey.Substring(0, [Math]::Min(15, $oldKey.Length)))..." -ForegroundColor Yellow
Write-Host "New API Key: $($NewApiKey.Substring(0, 15))..." -ForegroundColor Green

# Replace the API key
$newContent = $content -replace "RESEND_API_KEY=.*", "RESEND_API_KEY=$NewApiKey"

# Write back to file
$newContent | Set-Content $envFile -NoNewline

Write-Host ""
Write-Host "✅ API key updated successfully!" -ForegroundColor Green
Write-Host ""

# Show next steps
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Restart your development server (Ctrl+C and run 'npm run dev')" -ForegroundColor White
Write-Host "2. Test email functionality by registering a test user" -ForegroundColor White
Write-Host "3. Mark the GitGuardian alert as resolved" -ForegroundColor White
Write-Host "4. Delete the old API key from Resend dashboard" -ForegroundColor White
Write-Host ""
Write-Host "💾 Backup saved to: $backupFile" -ForegroundColor Yellow
Write-Host "   You can restore it if needed: Copy-Item $backupFile $envFile" -ForegroundColor Gray
Write-Host ""

# Verify the change
Write-Host "🔍 Verifying update..." -ForegroundColor Cyan
$verifyContent = Get-Content $envFile -Raw
if ($verifyContent -match "RESEND_API_KEY=$NewApiKey") {
    Write-Host "✅ Verification successful!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Warning: Could not verify the update. Please check manually." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✨ Done! Remember to update production environment variables if deployed." -ForegroundColor Green
Write-Host ""
