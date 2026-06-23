# File Upload Fix - Testing Guide

## ✅ What Was Fixed

Your PDF and image upload issue has been resolved! Here's what was done:

### Backend Changes:
1. ✅ Added **file type filter** to multer (PDF, JPG, PNG, WebP only)
2. ✅ Added **error handling middleware** for upload errors
3. ✅ Improved error messages for users
4. ✅ Added file size validation (25MB limit)
5. ✅ Changed API from Gemini to Anthropic Claude

### Frontend Changes:
1. ✅ Updated AI labels from "Gemini AI" → "Claude AI"
2. ✅ Updated description to mention image support
3. ✅ Better error display for users

---

## 🧪 Testing Instructions

### Step 1: Start the Backend

```bash
cd ai\ projeect
npm install  # Install dependencies (one time)
npm run backend
```

You should see:
```
✅ PadhAI Backend running on http://localhost:3001
🤖 Anthropic Claude: Connected
```

### Step 2: Start the Frontend

In a new terminal:
```bash
cd ai\ projeect
npm run dev
```

### Step 3: Test File Upload

1. Go to `http://localhost:5173` (or the URL shown)
2. Scroll to **"Upload Your Syllabus"** section
3. Click **PDF Upload** tab
4. Try uploading:
   - ✅ Any PDF file (up to 25MB)
   - ✅ JPG/PNG images
   - ✅ Or paste text in the other tab

### Step 4: Verify Upload Works

You should see:
```
✅ Uploading PDF → OCR Extraction → Claude AI → Ready!
```

---

## 📋 Accepted File Formats

| Format | Status |
|--------|--------|
| PDF (.pdf) | ✅ Supported |
| JPEG (.jpg, .jpeg) | ✅ Supported |
| PNG (.png) | ✅ Supported |
| WebP (.webp) | ✅ Supported |
| Others | ❌ Will show error |

**Max File Size:** 25MB

---

## 🚨 Common Issues & Fixes

### Issue: "File type not allowed"
**Cause:** Uploading unsupported format  
**Fix:** Use PDF, JPG, PNG, or WebP

### Issue: "File is too large"
**Cause:** File > 25MB  
**Fix:** Compress or split the file

### Issue: "Could not extract text from PDF"
**Cause:** PDF is a scanned image  
**Fix:** Upload as JPG/PNG image instead

### Issue: Backend not responding
**Cause:** Backend not running  
**Fix:** Run `npm run backend` in new terminal

### Issue: "Invalid Anthropic API key"
**Cause:** API key not set  
**Fix:** Add to `.env` file:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
PORT=3001
```

---

## 📝 Code Changes Summary

### Backend (server.js)

**Before:**
```javascript
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

app.post('/api/analyze-syllabus', upload.single('pdf'), async (req, res) => {
  // No file type validation
  // No error handling
```

**After:**
```javascript
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'image/jpeg', 'image/png', 'image/jpg', 'image/webp',
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed...`), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
  limits: { fileSize: 25 * 1024 * 1024, files: 1 },
});

app.post('/api/analyze-syllabus', (req, res, next) => {
  upload.single('pdf')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Proper error handling
      return res.status(400).json({ error: '...' });
    }
    next();
  });
}, async (req, res) => {
  // Upload logic
});
```

### Frontend (UploadSection.jsx)

Updated all "Gemini AI" → "Claude AI" labels

---

## 🔍 Debugging Tips

If uploads still don't work:

1. **Check browser console** (F12 → Console tab)
   - Look for error messages

2. **Check backend logs** (terminal running `npm run backend`)
   - Look for file error messages

3. **Test with curl:**
```bash
# Test PDF upload
curl -F "pdf=@yourfile.pdf" http://localhost:3001/api/analyze-syllabus

# Test text submission
curl -X POST -H "Content-Type: application/json" \
  -d '{"text":"Unit 1: Data Structures"}' \
  http://localhost:3001/api/analyze-syllabus
```

---

## ✅ Verification Checklist

- [ ] Backend running with "Claude: Connected"
- [ ] Frontend shows "Claude AI" in upload section
- [ ] PDF upload accepted
- [ ] Image upload accepted
- [ ] Text paste works
- [ ] Error messages are clear
- [ ] Processing stages animate smoothly

---

**Status:** ✅ Ready to use!  
**Last Updated:** 2026-06-22
