Param(
  [switch]$VerboseOutput
)

$workspace = (Get-Location).Path

$servers = @(
  @{ name = 'GitHub';      package = '@modelcontextprotocol/server-github';            args = @('--help') },
  @{ name = 'Filesystem';  package = '@modelcontextprotocol/server-filesystem';        args = @($workspace) },
  @{ name = 'Memory';      package = '@modelcontextprotocol/server-memory';            args = @('--help') },
  @{ name = 'Sequential';  package = '@modelcontextprotocol/server-sequential-thinking'; args = @('--help') },
  @{ name = 'Puppeteer';   package = '@modelcontextprotocol/server-puppeteer';         args = @('--help') },
  # Claimed servers in docs (may not exist on npm)
  @{ name = 'Clerk';       package = '@clerk/mcp';                                     args = @('--help') },
  @{ name = 'Convex';      package = '@convex-dev/mcp-server';                         args = @('--help') },
  @{ name = 'Stripe';      package = '@stripe/mcp';                                    args = @('--help') },
  @{ name = 'Google';      package = '@google-cloud/mcp-server';                       args = @('--help') }
)

Write-Host "Running MCP server smoke tests..." -ForegroundColor Cyan
$results = @()
$nodeExe = (Get-Command node).Source
$nodeDir = Split-Path $nodeExe -Parent
$npxCli = Join-Path $nodeDir 'node_modules/npm/bin/npx-cli.js'
if (-not (Test-Path $npxCli)) {
  Write-Host "Warning: npx-cli.js not found at $npxCli" -ForegroundColor Yellow
}

foreach ($s in $servers) {
  Write-Host ("- {0} ({1})" -f $s.name, $s.package) -NoNewline
  try {
    & $nodeExe $npxCli -y $($s.package) @($s.args)
    $code = $LASTEXITCODE
    $output = ''
    if ($code -eq 0) {
      Write-Host "  OK" -ForegroundColor Green
    } else {
      Write-Host ("  FAIL ({0})" -f $code) -ForegroundColor Red
    }
    if ($VerboseOutput) {
      Write-Host ($output.Trim())
    }
    $results += [pscustomobject]@{
      Server  = $s.name
      Package = $s.package
      ExitCode= $code
      Output  = ($output.Trim() -replace "\r", '')
    }
  } catch {
    Write-Host "  ERROR" -ForegroundColor Red
    $results += [pscustomobject]@{
      Server  = $s.name
      Package = $s.package
      ExitCode= 1
      Output  = $_.Exception.Message
    }
  }
}

Write-Host "\nEnvironment variable checks (presence only):" -ForegroundColor Cyan
$envVars = @(
  'GITHUB_PERSONAL_ACCESS_TOKEN',
  'CONVEX_DEPLOYMENT','NEXT_PUBLIC_CONVEX_URL',
  'CLERK_SECRET_KEY','CLERK_WEBHOOK_SECRET',
  'STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET',
  'GEMINI_API_KEY','GOOGLE_ANALYTICS_ID','GOOGLE_APPLICATION_CREDENTIALS'
)

foreach ($e in $envVars) {
  $val = [System.Environment]::GetEnvironmentVariable($e, 'Process')
  if (-not $val) { $val = [System.Environment]::GetEnvironmentVariable($e, 'User') }
  if (-not $val) { $val = [System.Environment]::GetEnvironmentVariable($e, 'Machine') }
  $present = [string]::IsNullOrWhiteSpace($val) -eq $false
  $status = if ($present) { 'present' } else { 'missing' }
  $color  = if ($present) { 'Green' } else { 'Yellow' }
  Write-Host ("- {0}: {1}" -f $e, $status) -ForegroundColor $color
}

Write-Host "\nSummary:" -ForegroundColor Cyan
$results | ForEach-Object {
  $status = if ($_.ExitCode -eq 0) { 'OK' } else { 'FAIL' }
  $fg = if ($_.ExitCode -eq 0) { 'Green' } else { 'Red' }
  Write-Host ("- {0}: {1}" -f $_.Server, $status) -ForegroundColor $fg
}

if ($VerboseOutput) {
  Write-Host "\nDetailed outputs captured in memory. Use -VerboseOutput to print." -ForegroundColor DarkGray
}

Exit 0
