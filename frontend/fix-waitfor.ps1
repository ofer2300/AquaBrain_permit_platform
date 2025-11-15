$file = "src/__tests__/LoginPage.test.tsx"
$content = Get-Content $file -Raw -Encoding UTF8

Write-Host "Fixing waitFor closing parentheses..." -ForegroundColor Cyan

# Pattern: Fix all waitFor calls missing closing parentheses before semicolon
# Before: await waitFor(() => expect(...);
# After:  await waitFor(() => expect(...));

# Fix localStorage.getItem('token').toBe(testToken);
$pattern1 = "await waitFor\(\(\) => expect\(localStorage\.getItem\('token'\)\)\.toBe\(testToken\);"
$replacement1 = "await waitFor(() => expect(localStorage.getItem('token')).toBe(testToken));"
$content = $content -replace [regex]::Escape($pattern1).Replace('\(', '(').Replace('\)', ')').Replace("\'", "'"), $replacement1

# Fix localStorage.getItem('user').toBe(JSON.stringify(testUser));
$pattern2 = "await waitFor\(\(\) => expect\(localStorage\.getItem\('user'\)\)\.toBe\(JSON\.stringify\(testUser\)\);"
$replacement2 = "await waitFor(() => expect(localStorage.getItem('user')).toBe(JSON.stringify(testUser)));"
$content = $content -replace [regex]::Escape($pattern2).Replace('\(', '(').Replace('\)', ')').Replace("\'", "'"), $replacement2

# Fix localStorage.getItem('token').toBeNull();
$pattern3 = "await waitFor\(\(\) => expect\(localStorage\.getItem\('token'\)\)\.toBeNull\(\);"
$replacement3 = "await waitFor(() => expect(localStorage.getItem('token')).toBeNull());"
$content = $content -replace [regex]::Escape($pattern3).Replace('\(', '(').Replace('\)', ')').Replace("\'", "'"), $replacement3

# Fix localStorage.getItem('user').toBeNull();
$pattern4 = "await waitFor\(\(\) => expect\(localStorage\.getItem\('user'\)\)\.toBeNull\(\);"
$replacement4 = "await waitFor(() => expect(localStorage.getItem('user')).toBeNull());"
$content = $content -replace [regex]::Escape($pattern4).Replace('\(', '(').Replace('\)', ')').Replace("\'", "'"), $replacement4

# Simple approach - just replace the patterns directly
$content = $content.Replace(
    "await waitFor(() => expect(localStorage.getItem('token')).toBe(testToken);",
    "await waitFor(() => expect(localStorage.getItem('token')).toBe(testToken));"
)

$content = $content.Replace(
    "await waitFor(() => expect(localStorage.getItem('user')).toBe(JSON.stringify(testUser));",
    "await waitFor(() => expect(localStorage.getItem('user')).toBe(JSON.stringify(testUser)));"
)

$content = $content.Replace(
    "await waitFor(() => expect(localStorage.getItem('token')).toBeNull();",
    "await waitFor(() => expect(localStorage.getItem('token')).toBeNull());"
)

$content = $content.Replace(
    "await waitFor(() => expect(localStorage.getItem('user')).toBeNull();",
    "await waitFor(() => expect(localStorage.getItem('user')).toBeNull());"
)

$content | Out-File -FilePath $file -Encoding UTF8 -NoNewline

Write-Host "✅ Fixed waitFor parentheses" -ForegroundColor Green
