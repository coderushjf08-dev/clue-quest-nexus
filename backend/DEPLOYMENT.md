# Deployment Guide

This guide covers deploying the Reverse Treasure Hunt backend to Railway and Render.

## 🚂 Railway Deployment

Railway is recommended for its simplicity and excellent PostgreSQL support.

### Step 1: Prepare Your Repository

1. Ensure your backend code is in the `backend/` directory
2. Commit and push all changes to GitHub

### Step 2: Create Railway Project

1. Go to [Railway](https://railway.app) and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository

### Step 3: Configure Build Settings

Railway will automatically detect the `railway.json` configuration file. If you need to manually configure:

1. Go to your project settings
2. Set **Root Directory**: `backend`
3. Set **Build Command**: `npm ci && npm run build`
4. Set **Start Command**: `npm start`

### Step 4: Add PostgreSQL Database

1. In your Railway project, click "New Service"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically create a database and provide connection details

### Step 5: Configure Environment Variables

In Railway project settings, add these environment variables:

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=${PGDATABASE_URL}  # Railway provides this automatically
JWT_SECRET=your-super-secure-jwt-secret-here
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-domain.com
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### Step 6: Deploy

1. Railway will automatically deploy when you push to your main branch
2. Check the deployment logs for any issues
3. Your API will be available at `https://your-project-name.railway.app`

### Step 7: Run Database Migrations

After first deployment, run migrations:

1. Go to Railway project → your web service
2. Open the "Deploy" tab
3. Click "View Logs" to see if migrations ran automatically
4. If needed, you can run migrations manually via Railway's CLI

## 🎨 Render Deployment

Render offers a great free tier and automatic deployments.

### Step 1: Prepare Blueprint

The `render.yaml` file in your backend directory contains the deployment configuration.

### Step 2: Create Render Account

1. Go to [Render](https://render.com) and sign up
2. Connect your GitHub account

### Step 3: Deploy with Blueprint

1. In Render dashboard, click "New +"
2. Select "Blueprint"
3. Connect your repository
4. Choose the `render.yaml` file in the `backend/` directory

### Step 4: Configure Environment Variables

Render will create services based on your blueprint, but you need to set these environment variables:

**In the web service settings**:
```env
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret-here
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-domain.com
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### Step 5: Database Setup

Render will automatically create a PostgreSQL database based on the blueprint. The `DATABASE_URL` will be automatically set.

### Step 6: Deploy

1. Render will automatically deploy your services
2. Monitor the build and deploy logs
3. Your API will be available at `https://your-service-name.onrender.com`

## 🔧 Post-Deployment Setup

### Database Initialization

After your first successful deployment, you need to initialize your database:

1. **Railway**: Use Railway CLI or connect to your database directly
2. **Render**: Use Render's web shell or connect via psql

Run these commands:
```bash
npm run migrate  # Create database schema
npm run seed     # Add sample data (optional)
```

### Health Check

Test your deployment:
```bash
curl https://your-api-domain.com/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

### Test API Endpoints

1. **Register a user**:
```bash
curl -X POST https://your-api-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"password123"}'
```

2. **Get hunts**:
```bash
curl https://your-api-domain.com/api/hunts
```

## 🌍 Environment Configuration

### Production Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | Yes | `production` |
| `PORT` | Server port | No | `3001` |
| `DATABASE_URL` | PostgreSQL connection | Yes | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | JWT signing secret | Yes | `super-secret-key-min-32-chars` |
| `JWT_EXPIRES_IN` | Token expiration | No | `7d` |
| `FRONTEND_URL` | Frontend domain for CORS | Yes | `https://yourapp.com` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes | `your-api-secret` |

### Generating Secure JWT Secret

```bash
# Generate a secure random string
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🔒 Security Considerations

### Production Checklist

- [ ] Strong JWT secret (minimum 32 characters)
- [ ] HTTPS enabled (automatic with Railway/Render)
- [ ] Environment variables properly set
- [ ] Database connection secured
- [ ] CORS configured for your frontend domain
- [ ] Rate limiting enabled
- [ ] File upload restrictions in place
- [ ] Error messages don't expose sensitive data

### Database Security

1. **Connection Security**: Always use SSL in production
2. **Access Control**: Limit database access to your application only
3. **Backups**: Enable automatic backups (available on both platforms)
4. **Monitoring**: Set up alerts for unusual activity

## 📊 Monitoring & Maintenance

### Health Monitoring

Both Railway and Render provide built-in monitoring. You can also set up external monitoring:

1. **Uptime Monitoring**: Use services like UptimeRobot or Pingdom
2. **Performance Monitoring**: Consider APM tools like New Relic or DataDog
3. **Error Tracking**: Integrate Sentry for error tracking

### Scaling

**Railway**:
- Automatic scaling based on traffic
- Upgrade to Pro plan for better performance

**Render**:
- Free tier has limitations (sleeps after inactivity)
- Upgrade to paid plan for better performance and no sleeping

### Maintenance

1. **Regular Updates**: Keep dependencies updated
2. **Database Maintenance**: Monitor database performance and storage
3. **Log Monitoring**: Regularly check application logs
4. **Backup Verification**: Ensure database backups are working

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Check build logs for specific errors

2. **Database Connection Issues**:
   - Verify DATABASE_URL format
   - Check database service status
   - Ensure SSL is configured correctly

3. **Environment Variables**:
   - Verify all required variables are set
   - Check for typos in variable names
   - Ensure secrets are properly formatted

4. **CORS Issues**:
   - Verify FRONTEND_URL matches your frontend domain
   - Check CORS configuration in server.ts
   - Ensure protocol (http/https) matches

### Getting Help

1. **Railway**: Check Railway docs and Discord community
2. **Render**: Check Render docs and community forum
3. **Application Issues**: Check application logs and error messages

### Log Access

**Railway**:
- Project → Service → Deploy tab → View Logs

**Render**:
- Service → Logs tab

## 🎯 Performance Optimization

### Production Optimizations

1. **Database**:
   - Enable connection pooling
   - Add database indexes for frequently queried fields
   - Use materialized views for leaderboards

2. **Caching**:
   - Implement Redis for session caching
   - Cache frequently accessed data
   - Use CDN for static assets

3. **Monitoring**:
   - Set up performance monitoring
   - Monitor database query performance
   - Track API response times

### Scaling Considerations

- **Horizontal Scaling**: Consider load balancing for high traffic
- **Database Scaling**: Use read replicas for read-heavy workloads
- **File Storage**: Cloudinary handles file scaling automatically
- **CDN**: Use CDN for static assets and API caching