$file = "src/__tests__/LoginPage.test.tsx"
$content = Get-Content $file -Raw -Encoding UTF8

Write-Host "Fixing ALL waitFor patterns..." -ForegroundColor Cyan

# Fix ALL instances of: await waitFor(() => ...);
# Should be: await waitFor(() => ...));

# Use a more comprehensive approach - find all lines with the pattern
$lines = $content -split "`r?`n"
$fixedLines = @()

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]

    # Check if line contains: await waitFor(() => ...);<space> but missing closing paren
    if ($line -match 'await waitFor\(\(\) => .*\);$' -and $line -notmatch 'await waitFor\(\(\) => .*\)\);$') {
        # Add the missing closing paren before semicolon
        $fixedLine = $line -replace '\);$', '));'
        Write-Host "Fixed line $($i+1): $line" -ForegroundColor Yellow
        Write-Host "     => $fixedLine" -ForegroundColor Green
        $fixedLines += $fixedLine
    }
    else {
        $fixedLines += $line
    }
}

$newContent = $fixedLines -join "`n"

$newContent | Out-File -FilePath $file -Encoding UTF8 -NoNewline

Write-Host "✅ Fixed all waitFor patterns" -ForegroundColor Green
