# Fix LoginPage.test.tsx syntax errors
$filePath = "C:/Users/USER/AQ/building-permit-platform/frontend/src/__tests__/LoginPage.test.tsx"
$content = Get-Content $filePath -Raw -Encoding UTF8

Write-Host "Fixing LoginPage.test.tsx syntax errors..." -ForegroundColor Cyan

# Pattern 1: Fix missing }); after mockResolvedValueOnce
$content = $content -replace '(\r?\n\s+data: \{ token: ''test-token'', user: \{ id: ''1'', email: ''test@example\.com'' \} \}\r?\n)(\s+render\()', '$1      });$2'
$content = $content -replace '(\r?\n\s+data: \{ token: testToken, user: testUser \}\r?\n)(\s+render\()', '$1      });$2'
$content = $content -replace '(\r?\n\s+data: \{ token: ''test-token'', user: \{ id: ''1'' \} \}\r?\n)(\s+render\()', '$1      });$2'
$content = $content -replace '(\r?\n\s+isAxiosError: true\r?\n)(\s+render\()', '$1      });$2'
$content = $content -replace '(\r?\n\s+data: \{\}\r?\n\s+\},\r?\n\s+isAxiosError: true\r?\n)(\s+render\()', '$1      });$2'

# Pattern 2: Fix missing }); after waitFor blocks
$content = $content -replace '(await waitFor\(\(\) => \{ expect\(mockedAxios\.post\)\.toHaveBeenCalledWith\(\s+expect\.stringContaining\(''/api/auth/login''\),\s+\{ email: ''test@example\.com'', password: ''password123'' \},\s+expect\.any\(Object\)\s+\);)\r?\n', '$1 });'
$content = $content -replace '(await waitFor\(\(\) => expect\(localStorage\.getItem\(''token''\)\)\.toBe\(testToken\);)', '$1);'
$content = $content -replace '(await waitFor\(\(\) => expect\(localStorage\.getItem\(''user''\)\)\.toBe\(JSON\.stringify\(testUser\)\);)', '$1);'
$content = $content -replace '(await waitFor\(\(\) => \{ expect\(mockNavigate\)\.toHaveBeenCalledWith\(''/dashboard'', \{ replace: true \}\);)', '$1 });'
$content = $content -replace '(await waitFor\(\(\) => expect\(screen\.queryByRole\(''alert''\)\)\.not\.toBeInTheDocument\(\);)', '$1);'
$content = $content -replace '(await waitFor\(\(\) => expect\(localStorage\.getItem\(''token''\)\)\.toBeNull\(\);)', '$1);'
$content = $content -replace '(await waitFor\(\(\) => expect\(localStorage\.getItem\(''user''\)\)\.toBeNull\(\);)', '$1);'
$content = $content -replace '(await waitFor\(\(\) => \{ expect\(mockedAxios\.post\)\.toHaveBeenCalledWith\(\s+expect\.stringContaining\(''/api/auth/login''\),\s+\{ email: ''user@example\.com'', password: ''securepassword'' \},\s+expect\.any\(Object\)\s+\);)', '$1 });'
$content = $content -replace '(await waitFor\(\(\) => \{ expect\(mockedAxios\.post\)\.toHaveBeenCalledWith\(\s+expect\.any\(String\),\s+expect\.any\(Object\),\s+\{\s+headers: \{\s+''Content-Type'': ''application/json''\s+\}\s+\}\s+\);)', '$1 });'
$content = $content -replace '(await waitFor\(\(\) => \{ expect\(mockedAxios\.post\)\.toHaveBeenCalledWith\(\s+expect\.any\(String\),\s+\{ email: ''test@example\.com'', password: specialPassword \},\s+expect\.any\(Object\)\s+\);)', '$1 });'

# Pattern 3: Fix wrong character in "סיסמה" (Hebrew vs Arabic)
$content = $content -replace 'סיسמה', 'סיסמה'

# Pattern 4: Fix missing closing brace in forEach at line 999
$content = $content -replace '(toggleButtons\.forEach\(btn => \{\s+expect\(btn\)\.toHaveAccessibleName\(\);)\r?\n', '$1$2      });'

# Pattern 5: Fix missing closing braces for all async test blocks
$content = $content -replace '(const errorMsg = await screen\.findByText\(/[^/]+/i\); expect\(errorMsg\)\.toBeVisible\(\);)\r?\n\s*\}\);', '$1$2    });'

Write-Host "✓ Fixed syntax errors" -ForegroundColor Green

# Save the corrected file
$content | Out-File -FilePath $filePath -Encoding UTF8 -NoNewline

Write-Host "✓ File saved: $filePath" -ForegroundColor Green
Write-Host "`nNow running tests to verify..." -ForegroundColor Cyan
