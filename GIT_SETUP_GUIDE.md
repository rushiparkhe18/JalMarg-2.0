# 🚀 GIT SETUP GUIDE - SAFE DEPLOYMENT

**CRITICAL: This guide ensures your sensitive credentials stay PRIVATE!**

---

## ⚠️ BEFORE YOU START - IMPORTANT!

### ❌ NEVER COMMIT THESE FILES:
- `.env` (contains MongoDB password, JWT secret)
- `node_modules/` (too large, auto-generated)
- `.next/` (build files)
- Any files with passwords or API keys

### ✅ SAFE TO COMMIT:
- `.env.example` (template without real credentials)
- Source code (`.js`, `.jsx`, `.json` files)
- Documentation (`.md` files)
- Configuration files (`package.json`, `next.config.js`)

---

## 📋 STEP-BY-STEP GIT SETUP

### Step 1: Navigate to Project Root

```powershell
cd "C:\Users\hp\Desktop\Jalmarg 2.0"
```

### Step 2: Initialize Git Repository

```powershell
git init
```

**Output:**
```
Initialized empty Git repository in C:/Users/hp/Desktop/Jalmarg 2.0/.git/
```

### Step 3: Verify .gitignore is Working

```powershell
# Check what will be committed (should NOT see .env files)
git status
```

**Expected:** You should see:
- ✅ `.gitignore` (the file itself)
- ✅ Source code files
- ✅ `README.md`, documentation
- ❌ **NO** `.env` files
- ❌ **NO** `node_modules/`
- ❌ **NO** `.next/` folders

**If you see `.env` files, STOP and check .gitignore!**

### Step 4: Create Initial Commit

```powershell
# Add all safe files
git add .

# Check what's staged
git status

# Create first commit
git commit -m "Initial commit: Jalmarg 2.0 Maritime Route Planning System"
```

### Step 5: Create Main Branch

```powershell
git branch -M main
```

### Step 6: Add Remote Repository

```powershell
git remote add origin https://github.com/rushiparkhe18/JalMarg-2.0.git
```

### Step 7: Push to GitHub

```powershell
# First push (sets upstream)
git push -u origin main
```

**If you get authentication errors, you may need a Personal Access Token (see below).**

---

## 🔐 HANDLING ENVIRONMENT VARIABLES (SAFE METHOD)

### Method 1: Local .env (Recommended)

**Your local `.env` file stays on your machine ONLY.**

1. ✅ Keep your `.env` file locally (already exists)
2. ✅ Add `.env` to `.gitignore` (already done)
3. ✅ Commit `.env.example` (template for others)
4. ✅ On new machines, copy `.env.example` to `.env` and fill in real values

**Your `.env` file:**
```bash
# This file is in .gitignore - NEVER committed to Git
MONGODB_URI=mongodb+srv://your-real-username:your-real-password@cluster.mongodb.net/jalmarg
JWT_SECRET=your-real-secret-key-here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**The `.env.example` (committed to Git):**
```bash
# Template - replace with your actual values
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jalmarg
JWT_SECRET=your-secret-key-min-32-characters-here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Method 2: GitHub Secrets (For Deployment)

If you're deploying (Vercel, Netlify, Heroku), add environment variables there:

**GitHub Secrets (for CI/CD):**
1. Go to: https://github.com/rushiparkhe18/JalMarg-2.0/settings/secrets/actions
2. Click "New repository secret"
3. Add each variable:
   - Name: `MONGODB_URI`
   - Value: `mongodb+srv://...` (your real value)
4. Repeat for `JWT_SECRET`, etc.

### Method 3: README Instructions

Add to your README.md:

```markdown
## 🔧 Setup Instructions

### 1. Clone Repository
\`\`\`bash
git clone https://github.com/rushiparkhe18/JalMarg-2.0.git
cd JalMarg-2.0
\`\`\`

### 2. Configure Environment Variables

**Backend:**
\`\`\`bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB credentials
\`\`\`

**Frontend (if needed):**
\`\`\`bash
cd frontend
cp .env.example .env.local
# Edit .env.local with your API keys
\`\`\`

### 3. Install Dependencies
\`\`\`bash
cd backend
npm install

cd ../frontend
npm install
\`\`\`

### 4. Start Application
\`\`\`bash
# Terminal 1 (Backend)
cd backend
npm start

# Terminal 2 (Frontend)
cd frontend
npm run dev
\`\`\`
```

---

## 🛡️ SECURITY CHECKLIST

Before pushing to GitHub:

- [ ] `.gitignore` file exists and includes `.env`
- [ ] Run `git status` - NO `.env` files listed
- [ ] Run `git status` - NO `node_modules/` listed
- [ ] `.env.example` has FAKE/PLACEHOLDER values only
- [ ] MongoDB password is NOT in any committed file
- [ ] JWT secret is NOT in any committed file
- [ ] Run `git log --all --full-history -- "*/.env"` - should return nothing

### Emergency: If You Accidentally Committed .env

**If you already pushed:**

```powershell
# Remove from Git history (dangerous - use carefully)
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch backend/.env" --prune-empty --tag-name-filter cat -- --all

# Force push (overwrites GitHub)
git push origin --force --all

# Immediately change your MongoDB password and JWT secret!
```

**Better:** Create a new repository and push again (cleaner).

---

## 🔑 GITHUB AUTHENTICATION

### Option 1: Personal Access Token (Recommended)

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo` (full control)
4. Copy the token (save it somewhere safe!)

**When pushing:**
```powershell
git push -u origin main

# Username: rushiparkhe18
# Password: <paste your token here>
```

### Option 2: SSH Key

```powershell
# Generate SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"

# Add to GitHub: https://github.com/settings/keys
# Copy public key
cat ~/.ssh/id_ed25519.pub

# Change remote to SSH
git remote set-url origin git@github.com:rushiparkhe18/JalMarg-2.0.git

# Push
git push -u origin main
```

---

## 📝 COMPLETE COMMAND SEQUENCE (SAFE)

```powershell
# 1. Navigate to project
cd "C:\Users\hp\Desktop\Jalmarg 2.0"

# 2. Initialize Git
git init

# 3. Verify .gitignore is working
git status
# ⚠️ CHECK: No .env files should appear!

# 4. Add all safe files
git add .

# 5. Check what's staged (verify again!)
git status

# 6. Create initial commit
git commit -m "Initial commit: Jalmarg 2.0 Maritime Route Planning System

Features:
- A* pathfinding algorithm for route optimization
- Three routing modes (FUEL, OPTIMAL, SAFE)
- Real-time weather integration (Open-Meteo API)
- Industry-standard fuel calculations
- MongoDB Atlas database
- Next.js 14 frontend with Leaflet.js maps
- JWT authentication with guest mode support"

# 7. Rename branch to main
git branch -M main

# 8. Add remote repository
git remote add origin https://github.com/rushiparkhe18/JalMarg-2.0.git

# 9. Push to GitHub
git push -u origin main

# 10. Verify on GitHub
# Open: https://github.com/rushiparkhe18/JalMarg-2.0
# Check: No .env files visible!
```

---

## 📂 WHAT WILL BE COMMITTED

### ✅ Files That WILL Be Committed:

**Root:**
- `README.md`
- `.gitignore`
- `COMPLETE_PROJECT_DOCUMENTATION.md`
- `EXAM_QUICK_REFERENCE.md`
- `DOCUMENTATION_SUMMARY.md`
- `HYDRATION_WARNING_FIX.md`
- All other `.md` documentation files
- `WEATHER_ROUTE_DEMO.js`
- `Indian Ocean Ports Data-updated.csv`

**Backend:**
- `backend/package.json`
- `backend/server.js`
- `backend/routeFinder.js`
- `backend/scoringEngine.js`
- `backend/weatherService.js`
- `backend/.env.example` ✅ (template only)
- All other `.js` files
- `backend/models/*.js`
- `backend/routes/*.js`
- `backend/middleware/*.js`

**Frontend:**
- `frontend/package.json`
- `frontend/next.config.js`
- `frontend/tailwind.config.js`
- `frontend/app/**/*.js`
- `frontend/components/**/*.jsx`
- `frontend/styles/*.css`

**Land Data:**
- `Land data/*.shp`
- `Land data/*.shx`
- `Land data/*.dbf`
- Other shapefile components

### ❌ Files That WILL NOT Be Committed:

- `backend/.env` ❌ (has real passwords)
- `backend/node_modules/` ❌ (too large)
- `frontend/.env.local` ❌ (local config)
- `frontend/node_modules/` ❌ (too large)
- `frontend/.next/` ❌ (build files)
- Any `*.log` files ❌
- Any `.DS_Store` or `Thumbs.db` ❌

---

## 🎓 FOR TEAM MEMBERS / COLLABORATORS

### How Others Can Clone and Setup

**Step 1: Clone Repository**
```powershell
git clone https://github.com/rushiparkhe18/JalMarg-2.0.git
cd JalMarg-2.0
```

**Step 2: Setup Environment Variables**
```powershell
# Backend
cd backend
cp .env.example .env
notepad .env  # Add real MongoDB URI and JWT secret
```

**Step 3: Install Dependencies**
```powershell
cd backend
npm install

cd ../frontend
npm install
```

**Step 4: Run Application**
```powershell
# Terminal 1
cd backend
npm start

# Terminal 2
cd frontend
npm run dev
```

---

## 🚨 EMERGENCY PROCEDURES

### If .env Was Accidentally Committed

**Immediate Actions:**

1. **Rotate ALL credentials:**
   - Change MongoDB password
   - Generate new JWT secret
   - Update all API keys

2. **Remove from Git history:**
```powershell
# Remove .env from all commits
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/.env frontend/.env.local" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (this rewrites history!)
git push origin --force --all
```

3. **Update GitHub:**
   - Delete repository
   - Create new one
   - Push clean code

### If Credentials Are Exposed

1. ✅ Immediately change MongoDB Atlas password
2. ✅ Generate new JWT secret
3. ✅ Rotate all API keys
4. ✅ Check MongoDB Atlas access logs
5. ✅ Consider creating new MongoDB cluster

---

## ✅ FINAL VERIFICATION

After pushing, verify on GitHub:

1. Go to: https://github.com/rushiparkhe18/JalMarg-2.0
2. Check "Code" tab
3. Verify:
   - ✅ `.gitignore` is present
   - ✅ `.env.example` is present
   - ❌ **NO** `.env` file visible
   - ❌ **NO** `node_modules/` folder
   - ❌ **NO** passwords in any file

4. Search repository:
   - Search for: `mongodb+srv://` (should only find .env.example)
   - Search for: your MongoDB password (should find NOTHING)
   - Search for: your JWT secret (should find NOTHING)

---

## 📖 ADDITIONAL RESOURCES

- **Git Documentation:** https://git-scm.com/doc
- **GitHub Security Best Practices:** https://docs.github.com/en/code-security
- **Environment Variables Guide:** https://12factor.net/config
- **.gitignore Examples:** https://github.com/github/gitignore

---

**REMEMBER:** Your `.env` file is like your house key - keep it safe, never share it publicly, and don't leave copies lying around!

**Status:** ✅ Ready for Safe Git Push  
**Date:** November 9, 2025  
**Security Level:** 🔒 Production-Ready
