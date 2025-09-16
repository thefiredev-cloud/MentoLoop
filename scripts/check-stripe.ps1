$key = [Environment]::GetEnvironmentVariable('STRIPE_SECRET_KEY', 'User')
if ([string]::IsNullOrWhiteSpace($key)) {
  Write-Output "stripe_ok=false"
  exit 0
}

try {
  $headers = @{ Authorization = "Bearer $key" }
  $res = Invoke-RestMethod -Method Get -Uri 'https://api.stripe.com/v1/products?limit=1' -Headers $headers
  $count = ($res.data | Measure-Object).Count
  Write-Output ("stripe_ok=true products_count=" + $count)
} catch {
  Write-Output "stripe_ok=false"
}


