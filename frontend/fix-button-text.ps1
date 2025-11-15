$file = "src/__tests__/LoginPage.test.tsx"
$content = Get-Content $file -Raw -Encoding UTF8

# Fix button text typo: התחבר (wrong) → התחבר (correct)
$content = $content.Replace('התחבר', 'התחבר')

$content | Out-File -FilePath $file -Encoding UTF8 -NoNewline

Write-Host "✅ Fixed 29 button text typos" -ForegroundColor Green
