# Production Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker (optional)
- Supabase account
- Gemini API key

### 1. Environment Setup

```bash
# Copy environment template
cp env.example .env.local

# Edit .env.local with your actual values
nano .env.local
```

Required environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```

### 2. Database Setup

```sql
-- Run this in your Supabase SQL editor
CREATE TABLE blueprints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  idea TEXT NOT NULL,
  status TEXT DEFAULT 'ANALYZING' CHECK (status IN ('ANALYZING', 'COMPLETED', 'FAILED')),
  market_analysis JSONB,
  technical_blueprint JSONB,
  implementation_plan JSONB,
  code_templates JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_blueprints_status ON blueprints(status);
CREATE INDEX idx_blueprints_created_at ON blueprints(created_at DESC);
```

### 3. Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Run type checking
npm run type-check

# Run linting
npm run lint
```

### 4. Production Build

```bash
# Build the application
npm run build

# Start production server
npm start

# Check health
npm run health
```

### 5. Docker Deployment

```bash
# Build Docker image
npm run docker:build

# Run with Docker Compose
npm run docker:compose

# Stop services
npm run docker:down
```

## 🔧 Configuration

### Rate Limiting
- API routes: 10 requests/second
- General routes: 30 requests/second
- Configurable via environment variables

### Security Features
- Input validation and sanitization
- XSS protection
- CSRF protection
- Rate limiting
- Security headers

### Monitoring
- Health check endpoint: `/api/health`
- Performance monitoring
- Error tracking
- Structured logging

## 📊 Performance

### Optimizations
- Next.js 15 with App Router
- Image optimization
- Code splitting
- Static generation where possible
- Database connection pooling

### Monitoring
- Performance metrics tracking
- Slow query detection
- Memory usage monitoring
- Response time tracking

## 🛡️ Security

### Best Practices
- Environment variable validation
- Input sanitization
- SQL injection prevention
- XSS protection
- Rate limiting
- Security headers

### Production Checklist
- [ ] Environment variables configured
- [ ] Database security policies set
- [ ] SSL/TLS certificates installed
- [ ] Firewall rules configured
- [ ] Monitoring setup
- [ ] Backup strategy implemented

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check Supabase credentials
   - Verify network connectivity
   - Check RLS policies

2. **AI Generation Failing**
   - Verify API key
   - Check rate limits
   - Review error logs

3. **Rate Limiting Issues**
   - Adjust rate limit settings
   - Check client IP detection
   - Review nginx configuration

### Health Check

```bash
# Check application health
curl http://localhost:3000/api/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": {
    "connected": true,
    "blueprintsCount": 0
  }
}
```

## 📈 Scaling

### Horizontal Scaling
- Use load balancer
- Multiple app instances
- Database read replicas
- CDN for static assets

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Enable caching
- Monitor performance metrics

## 🔄 Updates

### Deployment Process
1. Pull latest changes
2. Run tests
3. Build application
4. Deploy to production
5. Verify health check
6. Monitor for issues

### Rollback Plan
1. Keep previous version ready
2. Database migration rollback scripts
3. Environment variable backup
4. Monitoring alerts setup
