# Export scroll-video frames at full resolution (or 2x) into assets/video-frames-high
# Run from project root: .\scripts\export-frames-high-res.ps1

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path $PSScriptRoot -Parent
$assetsDir = Join-Path $projectRoot "assets"
$videoPath = Join-Path $assetsDir "scroll-video.mp4"
$outDir = Join-Path $assetsDir "video-frames-high"

if (-not (Test-Path $videoPath)) {
    Write-Host 'scroll-video.mp4 not found in assets' -ForegroundColor Red
    exit 1
}

if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    Write-Host 'FFmpeg not installed. Run: winget install ffmpeg' -ForegroundColor Red
    exit 1
}

New-Item -ItemType Directory -Force -Path $outDir | Out-Null
Push-Location $assetsDir

try {
    # 51 frames (0-50), full resolution, high quality PNG (single quotes so comma is not parsed by PowerShell)
    $filter = 'select=between(n,0,50)'
    ffmpeg -i "scroll-video.mp4" -vf $filter -vsync vfr -q:v 1 "video-frames-high/ezgif-frame-%03d.png"
    Write-Host 'Frames saved to assets/video-frames-high' -ForegroundColor Green
} finally {
    Pop-Location
}
