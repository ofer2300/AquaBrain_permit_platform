# 🚀 o3-analyze.ps1 Setup & Usage Guide

## 🔒 Step 1: Secure Your API Key (CRITICAL - DO THIS FIRST!)

### Revoke Exposed Key
1. Go to: https://platform.openai.com/api-keys
2. Find the key starting with `sk-proj-tFX-...`
3. Click "Revoke" or delete it

### Generate New Key
1. Click "Create new secret key"
2. Name it: `claude-code-o3-helper`
3. Copy the key (starts with `sk-proj-...`)

### Set Environment Variable

**Option A: Temporary (Current Session Only)**
```powershell
$env:OPENAI_API_KEY = "sk-proj-YOUR-NEW-KEY-HERE"
```

**Option B: Permanent (Add to PowerShell Profile)**
```powershell
# Open profile
notepad $PROFILE

# Add this line:
$env:OPENAI_API_KEY = "sk-proj-YOUR-NEW-KEY-HERE"

# Save and reload
. $PROFILE

# Verify
echo $env:OPENAI_API_KEY
```

**Option C: Secure .env File (Recommended for Projects)**
```powershell
# Create .env file in project root
cd C:\Users\USER\AQ\building-permit-platform
"OPENAI_API_KEY=sk-proj-YOUR-NEW-KEY" | Out-File -FilePath .env -Encoding UTF8

# Add to .gitignore
".env" | Out-File -FilePath .gitignore -Append

# Load in your scripts
Get-Content .env | ForEach-Object {
    $parts = $_ -split '=', 2
    [Environment]::SetEnvironmentVariable($parts[0], $parts[1], "Process")
}
```

---

## 📖 Step 2: Usage Examples

### Basic Usage (Recommended - gpt-4-turbo)
```powershell
cd C:\Users\USER\AQ\building-permit-platform\scripts

# Simple analysis
.\o3-analyze.ps1 -Prompt "Analyze the LoginPage.test.tsx file structure"

# Save to file
.\o3-analyze.ps1 -Prompt "Review authentication flow in /src/auth" -SaveToFile

# Custom output filename
.\o3-analyze.ps1 -Prompt "Security audit of API endpoints" -OutputFile "security-audit.md"
```

### Advanced Usage (When o3 is available)
```powershell
# Use o3 model with high reasoning
.\o3-analyze.ps1 -Prompt "Deep architectural analysis" -Model "o3" -ReasoningEffort "high"

# Use o3-mini for faster/cheaper
.\o3-analyze.ps1 -Prompt "Quick code review" -Model "o3-mini" -ReasoningEffort "medium"

# Longer responses
.\o3-analyze.ps1 -Prompt "Comprehensive refactoring plan" -MaxTokens 8192
```

---

## 🎯 Step 3: Practical Workflows

### Workflow 1: Morning Strategy Session
```powershell
# Get strategic direction for the day
.\o3-analyze.ps1 -Prompt @"
Analyze the Building Permit Platform project structure in C:\Users\USER\AQ\building-permit-platform.

Focus on:
1. Current test coverage gaps
2. Priority refactoring opportunities
3. Security vulnerabilities
4. Performance optimization targets

Provide a prioritized action plan for today.
"@ -OutputFile "daily-strategy.md"
```

### Workflow 2: Code Review Before Commit
```powershell
# Review changes before committing
.\o3-analyze.ps1 -Prompt @"
Review the recent changes to LoginPage component and tests.

Check for:
- Code quality issues
- Test coverage gaps
- Security concerns
- Performance implications
- Best practices violations

Provide specific improvement recommendations.
"@ -OutputFile "pre-commit-review.md"
```

### Workflow 3: Debug Complex Failure
```powershell
# Analyze test failures
.\o3-analyze.ps1 -Prompt @"
The LoginPage tests have 33 failures out of 55 tests (40% pass rate).

Common error pattern:
- "Found multiple elements" query selector issues
- Hebrew text matching problems
- Async/await timing issues

Provide:
1. Root cause analysis
2. Systematic fix strategy
3. Example code fixes for 3 most common failure types
4. Testing approach to prevent regressions
"@ -OutputFile "loginpage-fix-strategy.md"
```

### Workflow 4: Architecture Deep Dive
```powershell
# Comprehensive system analysis
.\o3-analyze.ps1 -Prompt @"
Perform architectural analysis of the Building Permit Platform:

Backend (Node.js/Express):
- 99 tests, 95% coverage
- Auth, File, Project modules

AI Service (Python/FastAPI):
- 116 tests, 85% coverage
- 20 Israeli building regulation rules
- PDF analysis with pdfplumber

Frontend (React/TypeScript):
- 160 tests, 37.5% pass rate
- Vitest + React Testing Library

Analyze:
1. Architectural strengths and weaknesses
2. Scaling bottlenecks
3. Security posture
4. Integration points needing improvement
5. Technology stack optimization opportunities

Provide a comprehensive technical roadmap.
"@ -Model "gpt-4-turbo" -MaxTokens 8192 -OutputFile "architecture-analysis.md"
```

---

## 🔧 Step 4: Troubleshooting

### Error: "OPENAI_API_KEY environment variable not set"
```powershell
# Check if key is set
echo $env:OPENAI_API_KEY

# If empty, set it:
$env:OPENAI_API_KEY = "your-key-here"
```

### Error: "401 Unauthorized"
- API key is invalid or revoked
- Generate a new key at platform.openai.com/api-keys

### Error: "404 Model not found"
- o3 model not available yet with your account
- Use `-Model "gpt-4-turbo"` instead

### Error: "429 Rate limit exceeded"
- Wait 60 seconds and try again
- Check your usage limits at platform.openai.com/usage

---

## 💰 Cost Optimization Tips

### Use Appropriate Models
```powershell
# Cheap & fast: Quick reviews
.\o3-analyze.ps1 -Prompt "..." -Model "gpt-4-turbo"  # ~$0.01/1K tokens

# Expensive & deep: Complex analysis only
.\o3-analyze.ps1 -Prompt "..." -Model "o3" -ReasoningEffort "high"  # ~$0.10/1K tokens (estimated)
```

### Batch Related Questions
```powershell
# Instead of 3 separate calls:
.\o3-analyze.ps1 -Prompt "Fix LoginPage test 1"
.\o3-analyze.ps1 -Prompt "Fix LoginPage test 2"
.\o3-analyze.ps1 -Prompt "Fix LoginPage test 3"

# Do this (1 call):
.\o3-analyze.ps1 -Prompt @"
Fix these 3 LoginPage test failures:
1. Test A with error X
2. Test B with error Y
3. Test C with error Z

Provide consolidated fix strategy.
"@
```

### Save Analyses for Reuse
```powershell
# Always save expensive analyses
.\o3-analyze.ps1 -Prompt "..." -Model "o3" -SaveToFile

# Review saved files before making duplicate requests
ls *.md | sort LastWriteTime -Descending | select -First 5
```

---

## 🎯 Integration with Claude Code

### Pattern: Analysis → Implementation → Validation

**Step 1: Get Strategic Direction**
```powershell
.\o3-analyze.ps1 -Prompt "Strategy for fixing LoginPage tests" -OutputFile "strategy.md"
```

**Step 2: Implement with Claude Code**
- Continue working in Claude Code CLI
- Use analysis from strategy.md as guidance
- Claude Code handles actual file edits

**Step 3: Validate Results**
```powershell
# After implementation
.\o3-analyze.ps1 -Prompt "Review the LoginPage test fixes I just implemented" -OutputFile "validation.md"
```

---

## 📊 Model Comparison

| Model | Speed | Cost | Reasoning Depth | Best For |
|-------|-------|------|-----------------|----------|
| **gpt-4-turbo** | Fast | Low | Good | Daily use, code reviews |
| **gpt-4** | Medium | Medium | Better | Important analysis |
| **o3-mini** | Medium | Medium | Very Good | Complex problems |
| **o3** | Slow | High | Exceptional | Critical architecture |

---

## ✅ Quick Start Checklist

- [ ] Revoke exposed API key
- [ ] Generate new API key
- [ ] Set `$env:OPENAI_API_KEY`
- [ ] Test script: `.\o3-analyze.ps1 -Prompt "Hello"`
- [ ] Save a sample analysis to verify file output
- [ ] Review cost after first few calls

---

## 📚 Next: Claude Desktop + MCP Setup

After the CLI helper is working, set up Claude Desktop integration:

1. **Install Codex MCP:**
   ```powershell
   npm install -g @modelcontextprotocol/server-codex
   ```

2. **Configure:**
   ```powershell
   notepad "$env:APPDATA\Claude\claude_desktop_config.json"
   ```

3. **Add both reasoning levels:**
   ```json
   {
     "mcpServers": {
       "codex-ultra": {
         "command": "codex",
         "args": ["-m", "o3", "-c", "model_reasoning_effort=high", "mcp"],
         "env": {
           "OPENAI_API_KEY": "your-new-key-here"
         }
       },
       "codex-fast": {
         "command": "codex",
         "args": ["-m", "gpt-4-turbo", "mcp"],
         "env": {
           "OPENAI_API_KEY": "your-new-key-here"
         }
       }
     }
   }
   ```

4. **Restart Claude Desktop**

5. **Test with:** `@codex-ultra` or `@codex-fast` prefixes

---

**Created:** 2025-01-12
**Project:** Building Permit Platform
**Location:** C:\Users\USER\AQ\building-permit-platform\scripts
