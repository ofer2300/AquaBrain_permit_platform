const fs = require('fs');
let content = fs.readFileSync('src/__tests__/LoginPage.test.tsx', 'utf8');

// Wrap API error assertions in waitFor with timeout
content = content.replace(
  /const errorMsg = await screen\.findByText\(\/שם משתמש או סיסמה שגויים\/i\);\s+expect\(errorMsg\)\.toBeInTheDocument\(\);/g,
  `await waitFor(async () => {
        const errorMsg = await screen.findByText(/שם משתמש או סיסמה שגויים/i);
        expect(errorMsg).toBeInTheDocument();
      }, { timeout: 3000 });`
);

content = content.replace(
  /const errorMsg = await screen\.findByText\(\/שגיאה בהתחברות\/i\);\s+expect\(errorMsg\)\.toBeInTheDocument\(\);/g,
  `await waitFor(async () => {
        const errorMsg = await screen.findByText(/שגיאה בהתחברות/i);
        expect(errorMsg).toBeInTheDocument();
      }, { timeout: 3000 });`
);

content = content.replace(
  /const errorMsg = await screen\.findByText\(\/שגיאת רשת\/i\);\s+expect\(errorMsg\)\.toBeInTheDocument\(\);/g,
  `await waitFor(async () => {
        const errorMsg = await screen.findByText(/שגיאת רשת/i);
        expect(errorMsg).toBeInTheDocument();
      }, { timeout: 3000 });`
);

content = content.replace(
  /const alert = await screen\.findByText\(\/Authentication failed\/i\);\s+expect\(alert\)\.toBeInTheDocument\(\);/g,
  `await waitFor(async () => {
        const alert = await screen.findByText(/Authentication failed/i);
        expect(alert).toBeInTheDocument();
      }, { timeout: 3000 });`
);

content = content.replace(
  /const errorMsg = await screen\.findByText\(\/Invalid credentials\/i\);\s+expect\(errorMsg\)\.toBeInTheDocument\(\);/g,
  `await waitFor(async () => {
        const errorMsg = await screen.findByText(/Invalid credentials/i);
        expect(errorMsg).toBeInTheDocument();
      }, { timeout: 3000 });`
);

fs.writeFileSync('src/__tests__/LoginPage.test.tsx', content, 'utf8');
console.log('Added waitFor to API error tests');
