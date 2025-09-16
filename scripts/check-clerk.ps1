$key = [Environment]::GetEnvironmentVariable('CLERK_SECRET_KEY', 'User')
if ([string]::IsNullOrWhiteSpace($key)) {
  Write-Output "clerk_ok=false"
  exit 0
}

try {
  $headers = @{ Authorization = "Bearer $key" }
  $res = Invoke-WebRequest -Method Get -Uri 'https://api.clerk.com/v1/instance' -Headers $headers -UseBasicParsing
  if ($res.StatusCode -eq 200 -and $res.Content) {
    Write-Output "clerk_ok=true"
  } else {
    Write-Output "clerk_ok=false"
  }
} catch {
  Write-Output "clerk_ok=false"
}


