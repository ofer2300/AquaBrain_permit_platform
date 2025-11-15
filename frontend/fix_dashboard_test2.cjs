const fs = require('fs');
const path = require('path');

const testFile = path.join(__dirname, 'src/__tests__/DashboardPage.test.tsx');
let content = fs.readFileSync(testFile, 'utf8');

// Step 1: Fix imports to include afterEach (already done)
content = content.replace(
  "import { describe, it, expect, beforeEach, vi } from 'vitest';",
  "import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';"
);

// Step 2: Add helper function right after the afterEach block
const searchPattern = `  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering and Loading State', () => {`;

const replacement = `  afterEach(() => {
    vi.useRealTimers();
  });

  const waitForDataLoad = async () => {
    await vi.runAllTimersAsync();
  };

  describe('Rendering and Loading State', () => {`;

if (content.includes(searchPattern)) {
  content = content.replace(searchPattern, replacement);
  console.log('Added waitForDataLoad helper function');
} else {
  console.log('Pattern not found, searching for alternative...');
}

// Step 3: Replace all await waitForDataLoad() calls that might be leftover from a previous attempt
content = content.replace(/await waitForDataLoad\(\);/g, 'await waitForDataLoad();');

fs.writeFileSync(testFile, content, 'utf8');
console.log('Test file updated successfully!');
