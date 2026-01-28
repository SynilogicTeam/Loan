# Quick Fix Script
Write-Host "🔍 Finding process on port 5001..." -ForegroundColor Cyan

$connections = Get-NetTCPConnection -LocalPort 5001 -ErrorAction SilentlyContinue
if ($connections) {
    $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
    Write-Host "Found $($pids.Count) process(es) using port 5001" -ForegroundColor Yellow
    
    foreach ($pid in $pids) {
        Write-Host "Killing process PID: $pid" -ForegroundColor Red
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
    
    Write-Host "✅ Port 5001 is now free!" -ForegroundColor Green
} else {
    Write-Host "✅ Port 5001 is already free!" -ForegroundColor Green
}

Write-Host "`n💡 Now restart your backend server with: npm run dev" -ForegroundColor Cyan
