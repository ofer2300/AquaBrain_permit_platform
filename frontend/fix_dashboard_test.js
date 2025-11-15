const fs = require('fs');
const path = require('path');

const testFile = path.join(__dirname, 'src/__tests__/DashboardPage.test.tsx');
let content = fs.readFileSync(testFile, 'utf8');

// Step 1: Fix imports to include afterEach
content = content.replace(
  "import { describe, it, expect, beforeEach, vi } from 'vitest';",
  "import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';"
);

// Step 2: Add helper function after afterEach
const helperFunction = `
  const waitForDataLoad = async () => {
    await vi.runAllTimersAsync();
  };
`;

content = content.replace(
  `  afterEach(() => {
    vi.useRealTimers();
  });`,
  `  afterEach(() => {
    vi.useRealTimers();
  });
${helperFunction}`
);

// Step 3: Replace all vi.advanceTimersByTime(800) with await waitForDataLoad()
content = content.replace(/vi\.advanceTimersByTime\(800\);/g, 'await waitForDataLoad();');

fs.writeFileSync(testFile, content, 'utf8');
console.log('Test file fixed successfully!');
