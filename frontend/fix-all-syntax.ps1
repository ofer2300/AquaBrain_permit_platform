$file = "src/__tests__/LoginPage.test.tsx"
$content = Get-Content $file -Raw -Encoding UTF8

Write-Host "Original file size: $($content.Length) characters" -ForegroundColor Cyan

# List of specific line fixes needed based on error analysis
# Fix 1: Line 429-430 - Missing }); after mockResolvedValueOnce
$content = $content -replace 'data: \{ token: ''test-token'', user: \{ id: ''1'', email: ''test@example\.com'' \} \}\s+render\(', "data: { token: 'test-token', user: { id: '1', email: 'test@example.com' } }`n      });`n`n      render("

# Fix 2: Line 459-460 - Missing }); after mockResolvedValueOnce
$content = $content -replace 'data: \{ token: testToken, user: testUser \}\s+render\(', "data: { token: testToken, user: testUser }`n      });`n`n      render("

# Fix 3: Line 483-484 - Missing }); after mockResolvedValueOnce
$content = $content -replace 'data: \{ token: ''test-token'', user: \{ id: ''1'' \} \}\s+render\(', "data: { token: 'test-token', user: { id: '1' } }`n      });`n`n      render("

# Fix 4: Line 505-507 - Missing }); after mockResolvedValueOnce
$content = $content -replace '(?m)(\s+it\(''clears API error message on successful login'', async \(\) => \{\s+mockedAxios\.post\.mockResolvedValueOnce\(\{\s+data: \{ token: ''test-token'', user: \{ id: ''1'' \} \})\s+(render\()', "`$1`n      });`n`n      `$2"

# Fix 5: Line 555-557 - Missing }); after mockResolvedValueOnce
$content = $content -replace '(?m)(it\(''re-enables form inputs after successful login'', async \(\) => \{\s+mockedAxios\.post\.mockResolvedValueOnce\(\{\s+data: \{ token: ''test-token'', user: \{ id: ''1'' \} \})\s+(render\()', "`$1`n      });`n`n      `$2"

# Fix 6-10: Missing }); after mockRejectedValueOnce
$content = $content -replace '(?m)(mockRejectedValueOnce\(\{\s+response: \{\s+data: \{[^\}]*\}\s+\},\s+isAxiosError: true)\s+(render\()', "`$1`n      });`n`n      `$2"

# Fix 11-15: Missing }); after mockResolvedValueOnce for edge cases
$content = $content -replace '(?m)(it\(''handles very long email addresses'', async \(\) => \{[^\}]*mockResolvedValueOnce\(\{\s+data: \{ token: ''test-token'', user: \{ id: ''1'' \} \})\s+(render\()', "`$1`n      });`n`n      `$2"

$content = $content -replace '(?m)(it\(''handles special characters in password'', async \(\) => \{\s+mockedAxios\.post\.mockResolvedValueOnce\(\{\s+data: \{ token: ''test-token'', user: \{ id: ''1'' \} \})\s+(render\()', "`$1`n      });`n`n      `$2"

$content = $content -replace '(?m)(it\(''handles rapid form submissions'', async \(\) => \{\s+mockedAxios\.post\.mockResolvedValueOnce\(\{\s+data: \{ token: ''test-token'', user: \{ id: ''1'' \} \})\s+(render\()', "`$1`n      });`n`n      `$2"

$content = $content -replace '(?m)(it\(''submits form with correct data structure'', async \(\) => \{\s+mockedAxios\.post\.mockResolvedValueOnce\(\{\s+data: \{ token: ''test-token'', user: \{ id: ''1'' \} \})\s+(render\()', "`$1`n      });`n`n      `$2"

$content = $content -replace '(?m)(it\(''sends correct headers with API request'', async \(\) => \{\s+mockedAxios\.post\.mockResolvedValueOnce\(\{\s+data: \{ token: ''test-token'', user: \{ id: ''1'' \} \})\s+(render\()', "`$1`n      });`n`n      `$2"

# Fix waitFor blocks missing closing braces
$content = $content -replace '(?m)(await waitFor\(\(\) => \{ expect\([^\}]+\);)\s+\}\);', '$1 });'

# Fix simple waitFor statements
$content = $content -replace '(?m)(await waitFor\(\(\) => expect\([^\)]+\)\);)\s+\}\);', '$1);'

# Fix forEach closing brace
$content = $content -replace '(?m)(toggleButtons\.forEach\(btn => \{\s+expect\(btn\)\.toHaveAccessibleName\(\);)\s+\}\);', '$1`n      });'

Write-Host "Fixed file size: $($content.Length) characters" -ForegroundColor Green

$content | Out-File -FilePath $file -Encoding UTF8 -NoNewline

Write-Host "✅ Syntax fixes applied to $file" -ForegroundColor Green
