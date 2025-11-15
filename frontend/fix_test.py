import re

# Read backup file
with open('src/__tests__/DashboardPage.test.tsx.backup', 'r', encoding='utf-8') as f:
    content = f.read()

# Step 1: Fix imports
content = content.replace(
    "import { describe, it, expect, beforeEach, vi } from 'vitest';",
    "import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';"
)

# Step 2: Add helper function after afterEach block
# Find the position after afterEach closing brace  
aftereach_pattern = r"(afterEach\(\) => \{\s+vi\.useRealTimers\(\);\s+\}\);)"
helper_function = r"\1\n\n  const waitForDataLoad = async () => {\n    await vi.runAllTimersAsync();\n  };"
content = re.sub(aftereach_pattern, helper_function, content, count=1)

# Step 3: Replace all vi.advanceTimersByTime(800) with await waitForDataLoad()
content = content.replace('vi.advanceTimersByTime(800);', 'await waitForDataLoad();')

# Write result
with open('src/__tests__/DashboardPage.test.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Test file fixed successfully!")
