# STUGUIDE X - Bootstrap and Environment Setup Script
# This script configures a self-contained Node.js environment and local MongoDB instance.

$ErrorActionPreference = "Stop"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "       STUGUIDE X - BOOTSTRAP ENVIRONMENT" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Download & Extract Portable Node.js if not present
$NodeDir = Join-Path $pwd ".node"
$NodeExe = Join-Path $NodeDir "node-v20.11.1-win-x64\node.exe"

if (-not (Test-Path $NodeExe)) {
    Write-Host "[+] Local Node.js runtime not found. Preparing download..." -ForegroundColor Yellow
    $NodeZip = Join-Path $pwd "node.zip"
    $NodeUrl = "https://nodejs.org/dist/v20.11.1/node-v20.11.1-win-x64.zip"
    
    if (Test-Path $NodeDir) {
        Remove-Item -Recurse -Force $NodeDir -ErrorAction SilentlyContinue
    }
    
    Write-Host "[+] Downloading Node.js v20.11.1 (30MB)..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $NodeUrl -OutFile $NodeZip
    
    Write-Host "[+] Extracting Node.js zip archive..." -ForegroundColor Yellow
    Expand-Archive -Path $NodeZip -DestinationPath $NodeDir
    
    Remove-Item -Force $NodeZip
    Write-Host "[✓] Node.js installed successfully in .node/" -ForegroundColor Green
} else {
    Write-Host "[✓] Portable Node.js runtime already available." -ForegroundColor Green
}

# Add Node path to process environment
$NodeBinPath = Join-Path $NodeDir "node-v20.11.1-win-x64"
$env:PATH = "$NodeBinPath;" + $env:PATH
Write-Host "[+] Added Node.js to current process PATH." -ForegroundColor Yellow

# Verify Node installation in this shell session
$nodeVersion = & node -v
$npmVersion = & npm -v
Write-Host "[✓] Node version: $nodeVersion" -ForegroundColor Green
Write-Host "[✓] NPM version: $npmVersion" -ForegroundColor Green

# 2. Configure Local MongoDB Instance
$DbDir = Join-Path $pwd ".db"
if (-not (Test-Path $DbDir)) {
    New-Item -ItemType Directory -Path $DbDir | Out-Null
    Write-Host "[+] Created local database storage folder: .db/" -ForegroundColor Yellow
}

$MongoPath = "C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe"
if (-not (Test-Path $MongoPath)) {
    # Try 8.0, 7.0 or fallback if not found
    $MongoPath = Get-ChildItem -Path "C:\Program Files\MongoDB" -Filter "mongod.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
}

if ($MongoPath) {
    Write-Host "[+] Found MongoDB executable at: $MongoPath" -ForegroundColor Yellow
    
    # Check if MongoDB is already running on port 27017
    $portActive = Get-NetTCPConnection -LocalPort 27017 -ErrorAction SilentlyContinue
    if ($portActive) {
        Write-Host "[✓] An instance is already running on Port 27017." -ForegroundColor Green
    } else {
        Write-Host "[+] Starting local MongoDB daemon process on Port 27017..." -ForegroundColor Yellow
        $LogPath = Join-Path $pwd "mongod.log"
        Start-Process -FilePath $MongoPath -ArgumentList "--dbpath=`"$DbDir`" --port 27017" -NoNewWindow -RedirectStandardOutput $LogPath -RedirectStandardError $LogPath
        
        # Wait a moment for database initialization
        Start-Sleep -Seconds 3
        Write-Host "[✓] MongoDB started successfully! Logs: mongod.log" -ForegroundColor Green
    }
} else {
    Write-Warning "[-] MongoDB Server executable was not found. Backend will run in HYBRID FALLBACK mode (In-Memory/JSON database)."
}

Write-Host "=============================================" -ForegroundColor Green
Write-Host "    Environment Ready! Initializing Repos..." -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
