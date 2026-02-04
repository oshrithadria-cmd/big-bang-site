$url = 'https://github.com/microsoft/cascadia-code/releases/download/v2404.23/CascadiaCode-2404.23.zip'
$zipPath = "$env:TEMP\CascadiaCode.zip"
$extractPath = "$env:TEMP\CascadiaCode"

Write-Host 'Downloading Cascadia Code...'
Invoke-WebRequest -Uri $url -OutFile $zipPath

Write-Host 'Extracting...'
Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force

Write-Host 'Installing fonts to user folder...'
$userFontsPath = "$env:LOCALAPPDATA\Microsoft\Windows\Fonts"
if (!(Test-Path $userFontsPath)) {
    New-Item -ItemType Directory -Path $userFontsPath -Force | Out-Null
}

$fonts = Get-ChildItem -Path "$extractPath\ttf" -Filter '*.ttf'
foreach ($font in $fonts) {
    Copy-Item $font.FullName $userFontsPath -Force
    Write-Host "Installed: $($font.Name)"
}

Write-Host 'Cleaning up...'
Remove-Item $zipPath -Force
Remove-Item $extractPath -Recurse -Force

Write-Host ''
Write-Host 'Cascadia Code installed successfully!'
Write-Host 'You may need to restart your terminal to see the new font.'
