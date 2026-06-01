param(
  [Parameter(Mandatory=$true)][string]$Src,
  [Parameter(Mandatory=$true)][string]$Dst,
  [Parameter(Mandatory=$true)][int]$X,
  [Parameter(Mandatory=$true)][int]$Y,
  [Parameter(Mandatory=$true)][int]$W,
  [Parameter(Mandatory=$true)][int]$H
)
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($Src)
$rect = New-Object System.Drawing.Rectangle($X, $Y, $W, $H)
$crop = New-Object System.Drawing.Bitmap($W, $H)
$g = [System.Drawing.Graphics]::FromImage($crop)
$g.DrawImage($img, (New-Object System.Drawing.Rectangle(0,0,$W,$H)), $rect, [System.Drawing.GraphicsUnit]::Pixel)
$crop.Save($Dst, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $crop.Dispose(); $img.Dispose()
Write-Output "Saved $Dst ($W x $H) from $Src at ($X,$Y)"
