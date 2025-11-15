#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fix all failing LoginPage.test.tsx tests"""

import re

# Read the file
with open('src/__tests__/LoginPage.test.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Replace incorrect password label /סिسमה/i with /סיסמה/i (correcting mixed Hebrew/Arabic)
content = content.replace('/סيسमה/i', '/סיסמה/i')

# Fix 2: Replace incorrect button text /התחבر/i with /התחבר/i where typo exists
content = content.replace('/התחבر/i', '/התחבר/i')

# Fix 3: Fix line 152 - proper formatting for error message assertion
content = re.sub(
    r'(\s+)const errorMsg = await screen\.findByText\(/אימייל נדרש/i\); expect\(errorMsg\)\.toBeVisible\(\);',
    r'\1const errorMsg = await screen.findByText(/אימייל נדרש/i);\n\1expect(errorMsg).toBeVisible();',
    content
)

# Fix 4: Fix line 183 - proper formatting for error message assertion
content = re.sub(
    r'(\s+)const errorMsg = await screen\.findByText\(/אימייל נדרש/i\); expect\(errorMsg\)\.toBeVisible\(\);(\s+)\}\);',
    r'\1const errorMsg = await screen.findByText(/אימייל נדרש/i);\n\1expect(errorMsg).toBeVisible();\n\2});',
    content
)

# Fix 5: Fix line 235 - proper formatting for password error
content = re.sub(
    r'(\s+)const errorMsg = await screen\.findByText\(/סיסמה נדרשת/i\); expect\(errorMsg\)\.toBeVisible\(\);',
    r'\1const errorMsg = await screen.findByText(/סיסמה נדרשת/i);\n\1expect(errorMsg).toBeVisible();',
    content
)

# Fix 6: Fix line 251 - proper formatting for password length error
content = re.sub(
    r'(\s+)const errorMsg = await screen\.findByText\(/סיסמה חייבת להכיל לפחות 6 תווים/i\); expect\(errorMsg\)\.toBeVisible\(\);',
    r'\1const errorMsg = await screen.findByText(/סיסמה חייבת להכיל לפחות 6 תווים/i);\n\1expect(errorMsg).toBeVisible();',
    content
)

# Fix 7: Fix line 421 - use await findByText for loading state
content = content.replace(
    'expect(screen.getByText(/טוען/i)).toBeInTheDocument();',
    'const loadingText = await screen.findByText(/טוען/i);\n        expect(loadingText).toBeInTheDocument();'
)

# Fix 8: Fix line 553-554 - add await waitFor for disabled inputs check
old_text_553 = '''      fireEvent.click(submitButton);


        expect(emailInput.disabled).toBe(true);
        expect(passwordInput.disabled).toBe(true);'''

new_text_553 = '''      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(emailInput.disabled).toBe(true);
        expect(passwordInput.disabled).toBe(true);
      });'''
content = content.replace(old_text_553, new_text_553)

# Fix 9: Fix line 607 - use await findByText for error message
content = content.replace(
    'expect(screen.getByText(/שם משתמש או סיסמה שגויים/i)).toBeInTheDocument();',
    'const errorMsg = await screen.findByText(/שם משתמש או סיסמה שגויים/i);\n        expect(errorMsg).toBeInTheDocument();'
)

# Fix 10: Fix line 634 - use await findByText for default error
content = content.replace(
    'expect(screen.getByText(/שגיאה בהתחברות/i)).toBeInTheDocument();',
    'const errorMsg = await screen.findByText(/שגיאה בהתחברות/i);\n        expect(errorMsg).toBeInTheDocument();'
)

# Fix 11: Fix line 656 - use await findByText for network error
content = content.replace(
    'expect(screen.getByText(/שגיאת רשת/i)).toBeInTheDocument();',
    'const errorMsg = await screen.findByText(/שגיאת רשת/i);\n        expect(errorMsg).toBeInTheDocument();'
)

# Fix 12: Fix line 738 - use await findByText for alert error
old_text_738 = '''      fireEvent.click(submitButton);


        const alert = screen.getByText(/Authentication failed/i);
        expect(alert).toBeInTheDocument();'''

new_text_738 = '''      fireEvent.click(submitButton);

      const alert = await screen.findByText(/Authentication failed/i);
      expect(alert).toBeInTheDocument();'''
content = content.replace(old_text_738, new_text_738)

# Fix 13: Fix line 770 - use await findByText for error message
content = content.replace(
    'expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();',
    'const errorMsg = await screen.findByText(/Invalid credentials/i);\n        expect(errorMsg).toBeInTheDocument();'
)

# Fix 14: Fix line 777 - use await waitFor for clearing error
old_text_777 = '''      fireEvent.click(submitButton);


        expect(screen.queryByText(/Invalid credentials/i)).not.toBeInTheDocument();'''

new_text_777 = '''      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText(/Invalid credentials/i)).not.toBeInTheDocument();
      });'''
content = content.replace(old_text_777, new_text_777)

# Fix 15: Fix line 1038 - add await waitFor for long email test
old_text_1038 = '''      fireEvent.click(submitButton);


        expect(mockedAxios.post).toHaveBeenCalled();'''

new_text_1038 = '''      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalled();
      });'''
content = content.replace(old_text_1038, new_text_1038)

# Fix 16: Fix line 1092 - add await waitFor for rapid submission test
old_text_1092 = '''      fireEvent.click(submitButton);

      expect(submitButton.disabled).toBe(true);'''

new_text_1092 = '''      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton.disabled).toBe(true);
      });'''
content = content.replace(old_text_1092, new_text_1092)

# Write the fixed content
with open('src/__tests__/LoginPage.test.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ All test fixes applied successfully!")
print("Fixed issues:")
print("1. Corrected password label selector from /סيسمה/i to /סיסמה/i")
print("2. Fixed async error message assertions (findByText)")
print("3. Added await waitFor for async state checks")
print("4. Fixed loading state assertion")
print("5. Fixed disabled inputs check")
print("6. Fixed error display assertions")
print("7. Fixed rapid submission test")
