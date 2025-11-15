# Fix LoginPage.test.tsx syntax errors
$file = "src/__tests__/LoginPage.test.tsx"

Write-Host "Fixing syntax errors in $file..." -ForegroundColor Cyan

# Read file
$lines = Get-Content $file -Encoding UTF8

# Track line numbers that need fixes
$newLines = @()

for ($i = 0; $i < $lines.Count; $i++) {
    $line = $lines[$i]
    $lineNum = $i + 1

    # Fix line 429: Add }); after mockResolvedValueOnce
    if ($lineNum -eq 429) {
        $newLines += "        data: { token: 'test-token', user: { id: '1', email: 'test@example.com' } }"
        $newLines += "      });"
        $newLines += ""
        continue
    }

    # Skip old line 430 (blank) and 431 (render - will be added above)
    if ($lineNum -in @(430)) {
        continue
    }

    # Fix line 446-450: Add }); to close waitFor
    if ($lineNum -eq 450) {
        $newLines += "        );"
        $newLines += "      });"
        continue
    }

    # Skip line 451 (old closing without parent)
    if ($lineNum -eq 451) {
        continue
    }

    # Fix line 459-460: Add }); after mockResolvedValueOnce
    if ($lineNum -eq 459) {
        $newLines += "        data: { token: testToken, user: testUser }"
        $newLines += "      });"
        $newLines += ""
        continue
    }

    if ($lineNum -eq 460) {
        continue
    }

    # Fix line 476-477: Add }); to close waitFor blocks
    if ($lineNum -eq 476) {
        $newLines += "        await waitFor(() => expect(localStorage.getItem('token')).toBe(testToken));"
        continue
    }

    if ($lineNum -eq 477) {
        $newLines += "        await waitFor(() => expect(localStorage.getItem('user')).toBe(JSON.stringify(testUser)));"
        continue
    }

    if ($lineNum -eq 478) {
        continue
    }

    # Fix line 483-484: Add }); after mockResolvedValueOnce
    if ($lineNum -eq 483) {
        $newLines += "        data: { token: 'test-token', user: { id: '1' } }"
        $newLines += "      });"
        $newLines += ""
        continue
    }

    if ($lineNum -eq 484) {
        continue
    }

    # Fix line 500: Add }); to close waitFor
    if ($lineNum -eq 500) {
        $newLines += "        await waitFor(() => { expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true }); });"
        continue
    }

    if ($lineNum -eq 501) {
        continue
    }

    # Add other fixes as needed...
    # For now, just add the line as-is
    $newLines += $line
}

# Write back
$newLines | Out-File -FilePath $file -Encoding UTF8

Write-Host "✓ Syntax errors fixed" -ForegroundColor Green
