$file = "src/__tests__/LoginPage.test.tsx"
$content = Get-Content $file -Raw -Encoding UTF8

Write-Host "Smart fix for all syntax errors..." -ForegroundColor Cyan

# Pattern 1: Fix missing }); after mockResolvedValueOnce({ ... })
# Look for: mockResolvedValueOnce({ data: { ... } })\n      render(
# Add: }); between them

$content = $content -replace '(?m)(mockResolvedValueOnce\(\{[^\}]*data: [^\}]*\}[^\}]*\})\s*\n(\s+render\()', "`$1`n      });`n`n`$2"
$content = $content -replace '(?m)(mockRejectedValueOnce\(\{[^\}]*isAxiosError: true)\s*\n(\s+render\()', "`$1`n      });`n`n`$2"

# Pattern 2: Fix waitFor with braces - need }); at end
# Example: await waitFor(() => { expect(...);
# Should become: await waitFor(() => { expect(...); });

$lines = $content -split "`n"
$fixedLines = @()
$i = 0

while ($i -lt $lines.Count) {
    $line = $lines[$i]

    # Check for waitFor with opening brace but no closing });
    if ($line -match '^\s+await waitFor\(\(\) => \{ expect\(') {
        # This line starts a waitFor with braces
        # Check if it has proper closing
        if ($line -notmatch '\}\);$') {
            # Missing closing }); - need to add it
            # The expect() call should end with );
            if ($line -match '(.*)\);$') {
                # Replace the ); at end with ; });
                $fixedLine = $line -replace '\);$', '; });'
                Write-Host "Fixed waitFor with braces: Line $($i+1)" -ForegroundColor Yellow
                $fixedLines += $fixedLine
                $i++
                continue
            }
        }
    }

    # Check for simple waitFor without braces - need )); at end
    # Example: await waitFor(() => expect(...);
    # Should become: await waitFor(() => expect(...));
    if ($line -match '^\s+await waitFor\(\(\) => expect\(' -and $line -notmatch '\{ expect\(') {
        # This is a simple waitFor without braces
        if ($line -match '\);$' -and $line -notmatch '\)\);$') {
            # Has ); but not ));
            $fixedLine = $line -replace '\);$', '));'
            Write-Host "Fixed simple waitFor: Line $($i+1)" -ForegroundColor Yellow
            $fixedLines += $fixedLine
            $i++
            continue
        }
    }

    # No fix needed, add as-is
    $fixedLines += $line
    $i++
}

$newContent = $fixedLines -join "`n"

$newContent | Out-File -FilePath $file -Encoding UTF8 -NoNewline

Write-Host "✅ All syntax errors fixed" -ForegroundColor Green
