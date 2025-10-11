# Finance Copilot - Troubleshooting Guide

## Common Errors After Rebrand

### ✅ FIXED: "Cannot read properties of undefined (reading 'call')"

**Cause**: Stale build cache from old "foundry-stack" package name  
**Solution**: Clear `.next` directory and rebuild

```bash
# PowerShell
Remove-Item -Recurse -Force .next
npm run build
```

### ✅ FIXED: "ENOENT: no such file or directory, open '.next/server/pages/_document.js'"

**Cause**: Next.js confused between App Router and Pages Router due to cached state  
**Solution**: Kill old processes, clear all caches, rebuild

```bash
# PowerShell
# Kill any running Next.js processes
taskkill /F /IM node.exe 2>$null

# Clear all caches
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules/.cache

# Rebuild
npm run build
npm run dev
```

## General Troubleshooting Steps

### 1. Clear All Caches
```bash
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules/.cache
Remove-Item -Recurse -Force .turbo
```

### 2. Reinstall Dependencies
```bash
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### 3. Check Environment Variables
Make sure `.env.local` has:
```env
GEMINI_API_KEY=your_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Port Conflicts
If you see "Port 3000 is in use":
```bash
# Option 1: Kill the process
taskkill /F /PID <process_id>

# Option 2: Use a different port
npm run dev -- -p 3001
```

### 5. TypeScript Errors
```bash
# Clean TypeScript cache
npx tsc --build --clean

# Run type check
npm run type-check
```

## Development Server Issues

### Dev Server Won't Start
1. Check if another process is using port 3000
2. Clear `.next` directory
3. Restart terminal/IDE

### Hot Reload Not Working
1. Clear `.next` directory
2. Restart dev server
3. Hard refresh browser (Ctrl+Shift+R)

### Build Errors After Rebrand
1. Search for any remaining "FoundryStack" references:
```bash
grep -r "FoundryStack" src/ --exclude-dir=node_modules
```

2. Clear and rebuild:
```bash
Remove-Item -Recurse -Force .next
npm run build
```

## API Errors

### 404 on `/api/finance-strategy`
1. Check file exists: `src/app/api/finance-strategy/route.ts`
2. Restart dev server
3. Clear `.next` directory

### Gemini API Errors
1. Verify `GEMINI_API_KEY` in `.env.local`
2. Check API key is valid at https://makersuite.google.com/app/apikey
3. Ensure no rate limits hit (free tier: 2 requests/minute)

### Redis Errors (Optional)
Redis is optional - mock client will be used if Redis is unavailable.
To use real Redis:
```bash
# Install Redis
# Windows: Use WSL or download from https://redis.io/

# Start Redis
redis-server

# Set REDIS_URL in .env.local
REDIS_URL=redis://localhost:6379
```

## Browser Errors

### Hydration Mismatch
1. Check for server/client rendering differences
2. Ensure `'use client'` directive is at top of client components
3. Clear browser cache
4. Hard refresh (Ctrl+Shift+R)

### Module Not Found
1. Check import paths use `@/` alias
2. Verify file exists at import path
3. Restart dev server

## Production Build Issues

### Build Fails
1. Run type check: `npm run type-check`
2. Check for linter errors: `npm run lint`
3. Clear cache and rebuild

### Build Succeeds but App Crashes
1. Check all environment variables are set
2. Verify all required dependencies are installed
3. Check server logs for specific errors

## Performance Issues

### Slow Build Times
1. Clear `.next` and `node_modules/.cache`
2. Close other applications
3. Restart IDE

### Slow Page Loads
1. Check for large imports
2. Use dynamic imports for heavy components
3. Optimize images and assets

## Getting Help

### Before Reporting an Issue:
1. ✅ Clear all caches (`.next`, `node_modules/.cache`)
2. ✅ Restart dev server
3. ✅ Check environment variables
4. ✅ Run `npm run build` to see build errors
5. ✅ Check browser console for errors

### Useful Commands:
```bash
# Check Next.js version
npm list next

# Check all installed packages
npm list --depth=0

# Verify build
npm run build

# Type check
npm run type-check

# Clean install
rm -rf node_modules package-lock.json .next
npm install
```

## Quick Reset (Nuclear Option)

If nothing else works:
```bash
# PowerShell
# Kill all Node processes
taskkill /F /IM node.exe

# Remove everything
Remove-Item -Recurse -Force node_modules, .next, package-lock.json

# Fresh install
npm install
npm run build
npm run dev
```

## Verified Working Configuration

**As of latest rebrand:**
- ✅ Package name: `finance-copilot`
- ✅ Next.js: 15.5.2
- ✅ React: 19.1.0
- ✅ Node: v18+ or v20+
- ✅ All routes building successfully
- ✅ 0 TypeScript errors
- ✅ 0 build errors

**Last successful build:**
```
✓ Compiled successfully in 13.5s
✓ Checking validity of types
✓ 10 routes generated
```

---

**Status**: All known errors fixed ✅  
**Last Updated**: After complete rebrand from FoundryStack to Finance Copilot

