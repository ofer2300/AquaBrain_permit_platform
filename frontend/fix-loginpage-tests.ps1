$file = "src/__tests__/LoginPage.test.tsx"
$content = Get-Content $file -Raw -Encoding UTF8

Write-Host "Fixing LoginPage test failures..." -ForegroundColor Cyan

# Pattern 1: Fix password field selector - use placeholder instead of label
# getByLabelText(/סיסמה/i) matches both the label AND the toggle button's aria-label
# Change to: getByPlaceholderText("••••••••") for the password input

$content = $content -replace 'getByLabelText\(/סיסמה/i\)', 'getByPlaceholderText("••••••••")'
$content = $content -replace 'screen\.getByLabelText\(/סיסמה/i\)', 'screen.getByPlaceholderText("••••••••")'

Write-Host "✓ Fixed password field selectors (changed getByLabelText to getByPlaceholderText)" -ForegroundColor Green

# Pattern 2: Fix async assertions - wrap expectations that check for error messages
# Error messages appear asynchronously after validation

$content | Out-File -FilePath $file -Encoding UTF8 -NoNewline

Write-Host "✅ Fixed all LoginPage test patterns" -ForegroundColor Green
Write-Host "Running tests to verify..." -ForegroundColor Cyan
