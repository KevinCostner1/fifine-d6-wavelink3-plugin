$ErrorActionPreference = 'Stop'
$src = Join-Path $PSScriptRoot 'WaveLink3.sdPlugin'
$dest = Join-Path $env:APPDATA 'HotSpot\StreamDock\plugins\com.costner.wavelink3.sdPlugin'

# Localiza somente o executável principal do FIFINE/StreamDock.
# Nunca usa node.exe/node20.exe como host: o Control Deck é baseado em Node/Electron.
$hostExe = $null
$knownNames = @(
  'FIFINE Control Deck.exe',
  'fifine Control Deck.exe',
  'StreamDock.exe',
  'MiraBox Stream Dock.exe'
)

try {
  $procs = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue
  foreach ($p in $procs) {
    $name = [string]$p.Name
    $path = [string]$p.ExecutablePath
    if (-not $path) { continue }
    if ($name -match '^(?i)(node|node20)(\.exe)?$') { continue }
    if ($name -match '(?i)^(fifine control deck|streamdock|mirabox stream dock)\.exe$') {
      if (Test-Path -LiteralPath $path) { $hostExe = $path; break }
    }
  }
} catch {}

# Se não encontrou o processo, procure instalações comuns.
if (-not $hostExe) {
  $candidates = @(
    "$env:ProgramFiles(x86)\fifine Control Deck\fifine Control Deck.exe",
    "$env:ProgramFiles\fifine Control Deck\fifine Control Deck.exe",
    "$env:ProgramFiles(x86)\FIFINE Control Deck\FIFINE Control Deck.exe",
    "$env:ProgramFiles\FIFINE Control Deck\FIFINE Control Deck.exe",
    "$env:ProgramFiles(x86)\fifine Control Deck\Control Deck.exe",
    "$env:ProgramFiles\fifine Control Deck\Control Deck.exe"
  )
  $hostExe = $candidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
}

# Fecha os hosts e processos do plugin novo/antigo para liberar arquivos.
try {
  $procs = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue
  foreach ($p in $procs) {
    if ($p.ProcessId -eq $PID) { continue }
    $name = [string]$p.Name
    $cmd = [string]$p.CommandLine
    $kill = $false
    if ($name -match '(?i)^(fifine control deck|streamdock|mirabox stream dock)\.exe$') { $kill = $true }
    if ($cmd -match '(?i)com\.costner\.wavelink3\.sdPlugin|com\.costner\.wavelink\.sdPlugin') { $kill = $true }
    if ($kill) { try { Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue } catch {} }
  }
} catch {}
Start-Sleep -Milliseconds 1800

# Instala a versão nova sem tocar no plugin antigo.
New-Item -ItemType Directory -Force (Split-Path $dest) | Out-Null
if (Test-Path -LiteralPath $dest) {
  Remove-Item -LiteralPath $dest -Recurse -Force -ErrorAction Stop
}
Copy-Item -Path $src -Destination $dest -Recurse -Force

# Reabre o aplicativo principal, nunca o Node.
if ($hostExe -and (Test-Path -LiteralPath $hostExe)) {
  Start-Process -FilePath $hostExe
} else {
  $start = $null
  try {
    $start = Get-StartApps | Where-Object { $_.Name -match '(?i)fifine.*control deck|control deck.*fifine' } | Select-Object -First 1
  } catch {}
  if ($start) {
    Start-Process explorer.exe "shell:AppsFolder\$($start.AppID)"
  } else {
    Write-Host 'Não consegui localizar o executável principal do FIFINE Control Deck.' -ForegroundColor Yellow
    Write-Host 'O plugin foi instalado. Abra o FIFINE Control Deck manualmente.' -ForegroundColor Yellow
  }
}

Write-Host ''
Write-Host 'Wave Link 3 Universal v1.0.0 instalado.' -ForegroundColor Green
Write-Host 'Plugin: com.costner.wavelink3.sdPlugin' -ForegroundColor Cyan
