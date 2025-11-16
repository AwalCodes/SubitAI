# SubitAI - Complete Testing Guide

## Overview
Comprehensive end-to-end testing procedures for the refactored SubitAI platform.

## Test Environment Setup

### Local Testing Environment

```bash
# 1. Start Cloudflare Worker locally
cd cloudflare-worker
npm install
npm run dev
# Worker runs on http://localhost:8787

# 2. Start Frontend (new terminal)
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:3000

# 3. Ensure Supabase is configured
# Check .env.local has correct keys
```

## Test Suite 1: Authentication & Authorization

### Test 1.1: User Registration
**Steps:**
1. Navigate to `/auth/signup`
2. Enter email: `test@example.com`
3. Enter password: `Test123!@#`
4. Click "Sign Up"

**Expected:**
- Success message displayed
- Verification email sent
- Redirected to dashboard

**Status:** [ ]

### Test 1.2: User Login
**Steps:**
1. Navigate to `/auth/login`
2. Enter credentials from Test 1.1
3. Click "Sign In"

**Expected:**
- User logged in successfully
- Dashboard loaded
- User info displayed in header

**Status:** [ ]

### Test 1.3: Protected Routes
**Steps:**
1. Sign out
2. Try accessing `/dashboard/upload` directly

**Expected:**
- Redirected to login page
- Error message: "Please sign in"

**Status:** [ ]

## Test Suite 2: File Upload & Validation

### Test 2.1: Upload Valid MP4 File
**Test File:** Use sample video (~50MB, 2-3 minutes)

**Steps:**
1. Navigate to `/dashboard/upload-v2`
2. Drag and drop valid MP4 file
3. Enter title: "Test Video 1"
4. Click "Generate Subtitles"

**Expected:**
- File accepted
- Upload progress shows real percentage (0-100%)
- Progress messages update ("Uploading...", "Processing...", etc.)
- Success message after completion
- Redirected to project page

**Status:** [ ]

### Test 2.2: Upload Valid MP3 Audio
**Test File:** MP3 audio file (~10MB)

**Steps:**
1. Navigate to `/dashboard/upload-v2`
2. Upload MP3 file
3. Enter title: "Test Audio 1"
4. Click "Generate Subtitles"

**Expected:**
- File accepted and processed
- Transcription completes faster than video
- Subtitles generated correctly

**Status:** [ ]

### Test 2.3: Upload Large File (500MB)
**Test File:** Large video file (close to 500MB limit)

**Steps:**
1. Upload 500MB video file
2. Monitor upload progress

**Expected:**
- Upload succeeds
- Progress bar accurate
- No timeout errors
- Processing completes

**Status:** [ ]

### Test 2.4: Upload Oversized File
**Test File:** File > 500MB

**Steps:**
1. Try to upload 600MB file

**Expected:**
- File rejected before upload
- Clear error: "File size exceeds 500MB limit"
- No charges incurred

**Status:** [ ]

### Test 2.5: Upload Invalid File Type
**Test File:** .txt or .pdf file

**Steps:**
1. Try to upload text file

**Expected:**
- File rejected
- Error: "Unsupported file type"
- Supported formats listed

**Status:** [ ]

### Test 2.6: Upload Without Title
**Steps:**
1. Select valid file
2. Leave title field empty
3. Click "Generate Subtitles"

**Expected:**
- Button disabled
- Tooltip: "Please enter a title"

**Status:** [ ]

## Test Suite 3: Transcription Quality

### Test 3.1: Clear English Audio
**Test File:** Clear speech, minimal background noise

**Steps:**
1. Upload and transcribe
2. Review generated subtitles

**Expected:**
- Transcription accuracy > 95%
- Proper punctuation
- Correct timestamps
- No missing words

**Status:** [ ]

### Test 3.2: Accented English
**Test File:** Non-native English speaker

**Steps:**
1. Upload and transcribe
2. Review accuracy

**Expected:**
- Reasonable accuracy (> 85%)
- Most words recognized
- May have minor errors

**Status:** [ ]

### Test 3.3: Multi-Speaker Audio
**Test File:** Interview or conversation

**Steps:**
1. Upload and transcribe
2. Check speaker separation

**Expected:**
- All speakers transcribed
- Timestamps accurate
- Text continuous

**Status:** [ ]

### Test 3.4: Background Music
**Test File:** Video with background music

**Steps:**
1. Upload and transcribe
2. Check if music affects quality

**Expected:**
- Speech recognized despite music
- No music lyrics in transcription
- Accuracy > 80%

**Status:** [ ]

### Test 3.5: Non-English Language (Spanish)
**Test File:** Spanish audio

**Steps:**
1. Upload Spanish audio
2. Set language to "Spanish" or "Auto"
3. Transcribe

**Expected:**
- Spanish text generated
- Proper characters (á, é, í, ó, ú, ñ)
- Good accuracy

**Status:** [ ]

## Test Suite 4: Subtitle Editing

### Test 4.1: Edit Subtitle Text
**Steps:**
1. Open project with subtitles
2. Click edit icon on any subtitle
3. Change text
4. Click save
5. Reload page

**Expected:**
- Text updated immediately
- Changes persisted to database
- Changes visible after reload

**Status:** [ ]

### Test 4.2: Delete Subtitle
**Steps:**
1. Click delete icon on subtitle
2. Confirm deletion
3. Check subtitle list

**Expected:**
- Confirmation dialog shown
- Subtitle removed from list
- Remaining subtitles renumbered
- Changes saved

**Status:** [ ]

### Test 4.3: Add New Subtitle
**Steps:**
1. Click "Add" button
2. Enter text
3. Save

**Expected:**
- New subtitle created at current time
- Default duration: 3 seconds
- Sorted by timestamp
- Editable immediately

**Status:** [ ]

### Test 4.4: Search Subtitles
**Steps:**
1. Enter search term in search box
2. View filtered results

**Expected:**
- Only matching subtitles shown
- Search is case-insensitive
- Live filtering as you type
- Clear search works

**Status:** [ ]

### Test 4.5: Keyboard Shortcuts
**Steps:**
1. Press Cmd/Ctrl + N

**Expected:**
- New subtitle added
- Edit mode activated

**Steps:**
2. Press Enter while editing

**Expected:**
- Changes saved
- Edit mode exits

**Steps:**
3. Press Escape while editing

**Expected:**
- Changes discarded
- Edit mode exits

**Status:** [ ]

## Test Suite 5: Video Playback & Sync

### Test 5.1: Video Playback
**Steps:**
1. Open project page
2. Click play button

**Expected:**
- Video plays smoothly
- No buffering (local)
- Audio synced

**Status:** [ ]

### Test 5.2: Subtitle Sync
**Steps:**
1. Play video
2. Watch subtitles

**Expected:**
- Subtitles appear at correct time
- Current subtitle highlighted
- Timing accurate (< 0.5s drift)

**Status:** [ ]

### Test 5.3: Seek to Subtitle
**Steps:**
1. Click timestamp on any subtitle

**Expected:**
- Video jumps to that timestamp
- Playback starts at that point
- Subtitle becomes active

**Status:** [ ]

### Test 5.4: Skip Forward/Back
**Steps:**
1. Click skip forward (+5s)
2. Click skip back (-5s)

**Expected:**
- Video jumps correctly
- Current subtitle updates
- Smooth transition

**Status:** [ ]

## Test Suite 6: Download & Export

### Test 6.1: Download SRT
**Steps:**
1. Click "Download SRT" button

**Expected:**
- File downloads immediately
- Filename: `[project-title].srt`
- File opens in text editor
- Valid SRT format
- All subtitles included

**Status:** [ ]

### Test 6.2: Download VTT
**Steps:**
1. Click "Download VTT" button

**Expected:**
- File downloads immediately
- Filename: `[project-title].vtt`
- Valid VTT format (starts with "WEBVTT")
- Compatible with HTML5 video

**Status:** [ ]

### Test 6.3: Test SRT File
**Steps:**
1. Download SRT
2. Open in VLC or similar player
3. Load with video

**Expected:**
- Subtitles display correctly
- Timing accurate
- No encoding issues

**Status:** [ ]

## Test Suite 7: Error Handling & Edge Cases

### Test 7.1: Network Failure During Upload
**Steps:**
1. Start file upload
2. Disable network mid-upload
3. Re-enable network

**Expected:**
- Error message: "Network error"
- Option to retry
- Retry succeeds

**Status:** [ ]

### Test 7.2: Transcription API Failure
**Steps:**
1. Configure with invalid Groq API key
2. Try to transcribe

**Expected:**
- Clear error message
- No partial data saved
- Project marked as failed

**Status:** [ ]

### Test 7.3: Slow Network
**Steps:**
1. Enable Chrome DevTools Network Throttling (Slow 3G)
2. Upload file

**Expected:**
- Upload still works
- Progress bar still updates
- Longer timeout (no premature failures)

**Status:** [ ]

### Test 7.4: Browser Crash During Upload
**Steps:**
1. Start upload
2. Close browser
3. Reopen and login

**Expected:**
- Project in database (status: failed or processing)
- Ability to retry or delete
- No orphaned files

**Status:** [ ]

### Test 7.5: Concurrent Uploads
**Steps:**
1. Open 3 tabs
2. Start upload in all 3 simultaneously

**Expected:**
- All uploads succeed
- No conflicts
- Proper project isolation

**Status:** [ ]

## Test Suite 8: Mobile Responsiveness

### Test 8.1: Mobile Upload (iOS Safari)
**Device:** iPhone 12 or similar

**Steps:**
1. Open site in Safari
2. Navigate to upload page
3. Tap to select file
4. Upload and transcribe

**Expected:**
- UI properly sized
- Tap targets large enough
- File picker works
- Upload succeeds

**Status:** [ ]

### Test 8.2: Mobile Upload (Android Chrome)
**Device:** Samsung/Pixel phone

**Steps:**
1. Repeat Test 8.1 on Android

**Expected:**
- Same functionality as iOS
- No layout breaks

**Status:** [ ]

### Test 8.3: Tablet View (iPad)
**Device:** iPad or similar

**Steps:**
1. Test full workflow on tablet

**Expected:**
- Optimal layout for tablet screen
- All features accessible
- Good use of screen space

**Status:** [ ]

### Test 8.4: Mobile Subtitle Editing
**Steps:**
1. Open project on mobile
2. Try editing subtitles

**Expected:**
- Editor usable on mobile
- Keyboard doesn't break layout
- Save/cancel buttons accessible

**Status:** [ ]

## Test Suite 9: Performance & Load

### Test 9.1: Large Subtitle Count
**Test Case:** Project with 500+ subtitles

**Steps:**
1. Generate or import large subtitle file
2. Open in editor
3. Scroll through list

**Expected:**
- Smooth scrolling
- No lag
- All subtitles load
- Search still fast

**Status:** [ ]

### Test 9.2: Rapid Sequential Requests
**Steps:**
1. Upload 5 files back-to-back
2. Monitor processing

**Expected:**
- All process successfully
- No rate limiting errors
- Reasonable queue time

**Status:** [ ]

### Test 9.3: Page Load Performance
**Steps:**
1. Use Lighthouse to test homepage
2. Test dashboard
3. Test upload page

**Expected:**
- Performance score > 90
- First Contentful Paint < 1.5s
- Time to Interactive < 3s

**Status:** [ ]

## Test Suite 10: Security

### Test 10.1: SQL Injection
**Steps:**
1. Try SQL injection in title field: `'; DROP TABLE projects; --`
2. Submit

**Expected:**
- Input sanitized
- No database changes
- Project created with literal text

**Status:** [ ]

### Test 10.2: XSS Attack
**Steps:**
1. Enter subtitle text: `<script>alert('XSS')</script>`
2. Save and view

**Expected:**
- Script not executed
- Text displayed as-is (escaped)

**Status:** [ ]

### Test 10.3: Unauthorized Access
**Steps:**
1. Get project ID from user A
2. Login as user B
3. Try to access user A's project

**Expected:**
- 404 or 403 error
- No data leaked
- Redirect to dashboard

**Status:** [ ]

### Test 10.4: CORS Bypass Attempt
**Steps:**
1. Try to call worker API from unauthorized origin

**Expected:**
- CORS error
- Request blocked
- No data returned

**Status:** [ ]

## Summary Report Template

```
Test Date: [DATE]
Tester: [NAME]
Environment: [Production/Staging/Local]
Browser: [Chrome/Firefox/Safari/Mobile]

Tests Passed: X / Y
Tests Failed: X / Y
Tests Skipped: X / Y

Critical Issues:
1. [Issue description]
2. ...

Minor Issues:
1. [Issue description]
2. ...

Performance Notes:
- Upload speed: [X MB/s]
- Transcription time: [X min for Y min video]
- Page load times: [Xms]

Recommendations:
1. [Recommendation]
2. ...
```

## Automated Testing Scripts

Create these test scripts for CI/CD:

```javascript
// tests/e2e/upload.test.ts
import { test, expect } from '@playwright/test'

test('complete upload flow', async ({ page }) => {
  await page.goto('/dashboard/upload-v2')
  
  // Upload file
  await page.setInputFiles('input[type="file"]', 'test-files/sample.mp4')
  
  // Enter title
  await page.fill('input[name="title"]', 'Test Video')
  
  // Submit
  await page.click('button:has-text("Generate Subtitles")')
  
  // Wait for completion
  await expect(page.locator('text=Success')).toBeVisible({ timeout: 60000 })
})
```

## Issue Reporting Template

```
Title: [Brief description]

Priority: [Critical/High/Medium/Low]

Steps to Reproduce:
1. 
2. 
3. 

Expected Behavior:


Actual Behavior:


Screenshots/Videos:
[Attach here]

Environment:
- Browser: 
- OS: 
- Device: 

Additional Context:
```

## Testing Schedule Recommendation

- **Before each deployment**: Run all critical tests (Suite 1, 2, 3, 6)
- **Weekly**: Full test suite
- **Monthly**: Performance and load tests
- **Quarterly**: Security audit

## Success Criteria

For production release, all tests must:
- ✅ Pass rate: > 95%
- ✅ Zero critical failures
- ✅ Performance scores > 90
- ✅ Mobile compatibility confirmed
- ✅ Security tests passed

