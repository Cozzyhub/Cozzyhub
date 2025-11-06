# 🚨 QUICK FIX - Resend API Key Exposed

## ⚡ Do This RIGHT NOW (5 minutes)

### Step 1: Revoke the Old Key
1. Open: https://resend.com/api-keys
2. Find key starting with: `re_NkDrNQRU...`
3. Click **Delete**

### Step 2: Create New Key
1. Click **Create API Key**
2. Name: "CozzyHub Production"
3. Copy the new key

### Step 3: Update Locally

**Option A: Use the Script (Recommended)**
```powershell
# Run this in PowerShell
.\rotate-credentials.ps1 -NewApiKey "re_YOUR_NEW_KEY"
```

**Option B: Manual Update**
```powershell
# Open .env.local
notepad .env.local

# Replace this line:
RESEND_API_KEY=re_YOUR_NEW_KEY_HERE

# Save and close
```

### Step 4: Restart Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 5: Test
1. Go to: http://localhost:3000/signup
2. Register a test user
3. Check if email arrives
4. ✅ Done!

## 📊 Status Check

Run this to verify everything is secure:
```powershell
# Check if .env.local is ignored
git check-ignore .env.local
# Should output: .env.local

# Check if any env files are staged
git status | Select-String ".env"
# Should be empty
```

## 🆘 Need Help?

- **Full details:** See `SECURITY_FIX_RESEND_LEAK.md`
- **Email not working:** Check Resend dashboard logs
- **Script error:** Update manually using Option B above

## ✅ When Done

Mark items as complete:
- [ ] Old key deleted from Resend
- [ ] New key created
- [ ] `.env.local` updated
- [ ] Server restarted
- [ ] Email tested successfully
- [ ] GitGuardian alert resolved

---

**Time to fix:** ~5 minutes  
**Severity:** Critical  
**Impact:** Email sending only
