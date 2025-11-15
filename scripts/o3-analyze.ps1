# o3-analyze.ps1
# Deep reasoning analysis using OpenAI o3 model
# Usage: .\o3-analyze.ps1 -prompt "Your analysis request" -output "result.md"

param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$Prompt,

    [Parameter(Mandatory=$false)]
    [ValidateSet("o3", "o3-mini", "gpt-4-turbo", "gpt-4")]
    [string]$Model = "gpt-4-turbo",

    [Parameter(Mandatory=$false)]
    [ValidateSet("low", "medium", "high")]
    [string]$ReasoningEffort = "high",

    [Parameter(Mandatory=$false)]
    [string]$OutputFile = "",

    [Parameter(Mandatory=$false)]
    [switch]$SaveToFile = $false,

    [Parameter(Mandatory=$false)]
    [int]$MaxTokens = 4096
)

# Color output functions
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

# Check for API key
if (-not $env:OPENAI_API_KEY) {
    Write-Error "❌ ERROR: OPENAI_API_KEY environment variable not set!"
    Write-Warning "`nTo fix this, run:"
    Write-Host '  $env:OPENAI_API_KEY = "your-key-here"' -ForegroundColor White
    Write-Warning "`nOr add to your PowerShell profile:"
    Write-Host "  notepad `$PROFILE" -ForegroundColor White
    exit 1
}

# Validate API key format
if ($env:OPENAI_API_KEY -notmatch "^sk-") {
    Write-Error "❌ ERROR: API key format appears invalid (should start with 'sk-')"
    exit 1
}

Write-Info "🔍 Invoking OpenAI $Model with $ReasoningEffort reasoning effort..."
Write-Info "📝 Prompt length: $($Prompt.Length) characters"

# Prepare request headers
$headers = @{
    "Authorization" = "Bearer $env:OPENAI_API_KEY"
    "Content-Type" = "application/json"
}

# Prepare request body
$bodyObject = @{
    model = $Model
    messages = @(
        @{
            role = "system"
            content = "You are an expert software architect and senior developer performing deep technical analysis. Provide structured, actionable insights with code examples. Use markdown formatting for clarity."
        },
        @{
            role = "user"
            content = $Prompt
        }
    )
    max_tokens = $MaxTokens
    temperature = 0.7
}

# Add reasoning_effort for o3 models only
if ($Model -like "o3*") {
    $bodyObject.reasoning_effort = $ReasoningEffort
}

$body = $bodyObject | ConvertTo-Json -Depth 10

try {
    # Make API request
    $response = Invoke-RestMethod -Uri "https://api.openai.com/v1/chat/completions" `
        -Method Post `
        -Headers $headers `
        -Body $body `
        -ErrorAction Stop

    # Extract response content
    $content = $response.choices[0].message.content

    # Display response
    Write-Success "`n✅ Analysis complete!`n"
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor DarkGray
    Write-Host $content
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor DarkGray

    # Display token usage
    Write-Host "`n📊 TOKEN USAGE:" -ForegroundColor Magenta
    Write-Host "  • Prompt tokens:     $($response.usage.prompt_tokens)" -ForegroundColor White
    Write-Host "  • Completion tokens: $($response.usage.completion_tokens)" -ForegroundColor White
    Write-Host "  • Total tokens:      $($response.usage.total_tokens)" -ForegroundColor Yellow

    # Calculate approximate cost (update these rates based on current pricing)
    $promptCost = switch ($Model) {
        "o3" { 0.015 }  # Estimated - check actual pricing
        "o3-mini" { 0.01 }
        "gpt-4-turbo" { 0.01 }
        "gpt-4" { 0.03 }
        default { 0.01 }
    }
    $completionCost = $promptCost * 2
    $estimatedCost = ($response.usage.prompt_tokens * $promptCost / 1000) +
                     ($response.usage.completion_tokens * $completionCost / 1000)
    Write-Host "  • Estimated cost:    `$$([math]::Round($estimatedCost, 4))" -ForegroundColor Yellow

    # Save to file if requested
    if ($SaveToFile -or $OutputFile) {
        $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
        if (-not $OutputFile) {
            $OutputFile = "analysis_$timestamp.md"
        }

        # Create markdown output with metadata
        $markdownOutput = @"
# AI Analysis Report
**Generated:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Model:** $Model
**Reasoning Effort:** $ReasoningEffort
**Tokens Used:** $($response.usage.total_tokens)

---

## Prompt
$Prompt

---

## Analysis

$content

---

**Token Usage:**
- Prompt: $($response.usage.prompt_tokens)
- Completion: $($response.usage.completion_tokens)
- Total: $($response.usage.total_tokens)
- Estimated Cost: `$$([math]::Round($estimatedCost, 4))
"@

        $markdownOutput | Out-File -FilePath $OutputFile -Encoding UTF8
        Write-Success "`n💾 Saved to: $OutputFile"
    }

    # Return for programmatic use
    return $content

} catch {
    Write-Error "`n❌ ERROR: API request failed"
    Write-Host "Error details:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red

    if ($_.ErrorDetails.Message) {
        Write-Host "`nAPI Response:" -ForegroundColor Red
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }

    # Common error messages
    if ($_.Exception.Message -like "*401*") {
        Write-Warning "`n⚠️  Authentication failed. Check your API key."
    } elseif ($_.Exception.Message -like "*429*") {
        Write-Warning "`n⚠️  Rate limit exceeded. Wait a moment and try again."
    } elseif ($_.Exception.Message -like "*404*") {
        Write-Warning "`n⚠️  Model not found. Check if '$Model' is available with your API key."
        Write-Info "`nTry: gpt-4-turbo (most reliable)"
    }

    exit 1
}
