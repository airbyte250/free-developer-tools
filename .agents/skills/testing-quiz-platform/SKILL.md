---
name: testing-quiz-platform
description: Test the multi-tenant quiz platform (coolganwar.com) end-to-end. Use when verifying mobile responsiveness, footer links, admin CRUD, or quiz flow changes.
---

# Testing Quiz Platform

## Devin Secrets Needed
- `SSH_PASSWORD` — root password for the production server
- `SERVER_IP` — IP address of the Hetzner VPS

## Environment
- **Frontend:** https://coolganwar.com
- **Admin Dashboard:** https://app.coolganwar.com
- **Admin Login:** admin / CoolGanwar@2026
- **Server:** Ubuntu 24.04, PM2 cluster mode (4 instances), Nginx reverse proxy, Redis cache (5-min TTL)
- **Database:** PostgreSQL (user: quizuser, db: quiz_platform)

## Testing Procedures

### Mobile Responsive Testing
1. Enable mobile emulation via browser tool (`set_mobile` enabled=true)
2. Navigate to https://coolganwar.com/quiz
3. Verify no horizontal overflow: `document.documentElement.scrollWidth === document.documentElement.clientWidth`
4. Verify cards stack in single-column layout
5. Scroll to bottom to verify footer is visible
6. Disable mobile emulation after test

### Footer Link Testing
1. Desktop viewport, navigate to /quiz
2. Scroll to footer section
3. Verify 4 columns: Company, Legal, Resources, Connect
4. Key links to verify: /privacy, /terms, /disclaimer, /contact
5. Click at least one link (e.g. Disclaimer) and verify page loads with content

### Admin Quiz CRUD Testing
1. Navigate to https://app.coolganwar.com/admin/quizzes (login required)
2. Note current quiz count
3. **Create:** Click "+ Add New Quiz", select category, fill slug/title/step1 question+options, click "Create Quiz"
4. Verify count increments and quiz appears in list
5. **Edit:** Click "Edit" on the created quiz, modify article field, click "Update Quiz"
6. **Important:** Flush Redis cache before verifying frontend: `redis-cli FLUSHALL` (via SSH)
7. Navigate to https://coolganwar.com/quiz?q={slug}&step=result to verify article renders
8. **Delete:** Click "Delete" on the quiz, verify count decrements
9. Flush Redis again, verify frontend shows "Quiz Not Found"

### Important Notes
- **Redis Cache:** The platform uses a 5-minute TTL Redis cache. After any CRUD operation, flush Redis on the server before verifying frontend changes. Without flushing, you'll see stale data.
- **React Textareas:** When setting textarea values programmatically (e.g. article HTML), use the native input value setter pattern to trigger React state updates:
  ```js
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
  nativeInputValueSetter.call(textarea, 'new value');
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  ```
- **Page Load Times:** Admin quizzes page might take 2-3 seconds to load due to fetching 98+ quizzes. Wait before interacting.
- **Form Elements:** The form appears at the bottom of the page when "+ Add New Quiz" is clicked. Use `document.querySelector('form').scrollIntoView()` to navigate to it.
- **Quiz Deletion:** There is no confirmation dialog — clicking Delete immediately deletes the quiz and shows a success message.
