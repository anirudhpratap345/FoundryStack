# Vercel Deployment Guide

## 🚀 Quick Deploy to Vercel

### Prerequisites
- Vercel account
- GitHub repository
- Environment variables ready

### 1. Environment Variables Setup

In your Vercel dashboard, add these environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
AI_PROVIDER=gemini

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=5

# Security
CORS_ORIGIN=https://your-app.vercel.app
ENABLE_CORS=true

# Monitoring
ENABLE_LOGGING=true
LOG_LEVEL=info
ENABLE_ANALYTICS=false
ENABLE_ERROR_TRACKING=false

# Feature Flags
ENABLE_RATE_LIMITING=true
```

### 2. Deploy from GitHub

1. **Connect Repository**
   - Go to Vercel Dashboard
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Install Command: `npm install --legacy-peer-deps`
   - Output Directory: `.next`

3. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### 3. Post-Deployment Setup

1. **Verify Health Check**
   ```bash
   curl https://your-app.vercel.app/api/health
   ```

2. **Test Blueprint Creation**
   - Visit your app URL
   - Try creating a blueprint
   - Check if AI generation works

3. **Monitor Logs**
   - Check Vercel function logs
   - Monitor for any errors
   - Verify environment variables

### 4. Troubleshooting

#### Build Failures
- **Dependency Conflicts**: The `.npmrc` file handles this with `legacy-peer-deps=true`
- **React 19 Compatibility**: Updated testing library to v15.0.0
- **Memory Issues**: Vercel provides 8GB for builds

#### Runtime Issues
- **Environment Variables**: Double-check all required variables are set
- **API Limits**: Monitor Gemini API usage and limits
- **Database Connection**: Verify Supabase credentials

#### Performance Issues
- **Cold Starts**: First request may be slower
- **Function Timeout**: Set to 30 seconds in `vercel.json`
- **Memory Usage**: Monitor function memory usage

### 5. Production Optimizations

#### Enable Analytics
```env
ENABLE_ANALYTICS=true
ENABLE_ERROR_TRACKING=true
```

#### Configure Custom Domain
1. Go to Project Settings
2. Add your custom domain
3. Update CORS_ORIGIN environment variable

#### Set Up Monitoring
1. Connect Vercel Analytics
2. Set up error tracking (Sentry, etc.)
3. Monitor function performance

### 6. Environment-Specific Configurations

#### Development
```env
NODE_ENV=development
LOG_LEVEL=debug
ENABLE_LOGGING=true
```

#### Production
```env
NODE_ENV=production
LOG_LEVEL=info
ENABLE_LOGGING=true
ENABLE_ANALYTICS=true
```

### 7. Security Checklist

- [ ] All environment variables set
- [ ] CORS_ORIGIN configured correctly
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Database RLS policies set
- [ ] API keys secured

### 8. Performance Checklist

- [ ] Build completes successfully
- [ ] Health check returns 200
- [ ] Blueprint creation works
- [ ] AI generation completes
- [ ] Database queries optimized
- [ ] Static assets cached

### 9. Monitoring & Alerts

#### Set Up Alerts
1. **Function Errors**: Monitor for 500 errors
2. **Response Time**: Alert if > 5 seconds
3. **Memory Usage**: Alert if > 80%
4. **API Quota**: Monitor Gemini API usage

#### Health Monitoring
- **Endpoint**: `/api/health`
- **Frequency**: Every 5 minutes
- **Expected Response**: 200 OK with health status

### 10. Rollback Plan

If deployment fails:
1. **Revert to Previous Version**: Use Vercel's rollback feature
2. **Check Logs**: Identify the specific error
3. **Fix Issues**: Update code and redeploy
4. **Test Thoroughly**: Verify all functionality works

## 🎉 Success!

Your Foundry Stack app should now be live on Vercel with:
- ✅ Production-ready build
- ✅ Environment variables configured
- ✅ Database connected
- ✅ AI generation working
- ✅ Health monitoring active
- ✅ Security measures in place

**Your app URL**: `https://your-app.vercel.app`
