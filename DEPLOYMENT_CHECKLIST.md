# Deployment Checklist

## ✅ Pre-Deployment Requirements

### Environment Variables (Update .env)
- [ ] `MONGO_URL` - Your MongoDB connection string (e.g., `mongodb+srv://...`)
- [ ] `DB_NAME` - Database name (e.g., `golden_touch_prod`)
- [ ] `SMTP_USER` - Gmail email address
- [ ] `SMTP_PASS` - Gmail app-specific password (16 chars)
- [ ] `BUSINESS_EMAIL` - Where booking notifications go
- [ ] `ADMIN_PASSWORD` - Strong admin password (NOT "Amasarpong2006")
- [ ] `CORS_ORIGINS` - Your frontend URL (e.g., `https://yourdomain.com`)
- [ ] `FRONTEND_URL` - Frontend URL for email links

### Critical Security Steps
- [ ] **Change `ADMIN_PASSWORD`** to a strong, unique password
- [ ] **Never commit `.env` file** - it's already in `.gitignore`
- [ ] **Verify `.env` is in .gitignore**
- [ ] **Rotate SMTP_PASS** if shared

### Database Preparation
- [ ] MongoDB cluster is running and accessible
- [ ] Database exists with name specified in `DB_NAME`
- [ ] Create MongoDB indexes:
  ```javascript
  // In MongoDB compass or shell
  db.bookings.createIndex({ "bookingId": 1 }, { unique: true })
  db.bookings.createIndex({ "email": 1 })
  db.bookings.createIndex({ "customerId": 1 })
  
  db.sessions.createIndex({ "token": 1 }, { unique: true })
  db.sessions.createIndex({ "expires_at": 1 }, { expireAfterSeconds: 0 })
  
  db.status_checks.createIndex({ "timestamp": 1 })
  ```

### Dependencies
- [ ] Python 3.8+ installed
- [ ] All packages installed: `pip install -r requirements.txt`
- [ ] Verify bcrypt/passlib installed: `pip list | grep -E "bcrypt|passlib"`

### Frontend Configuration
- [ ] Update `CORS_ORIGINS` to match your deployment domain
- [ ] Update `FRONTEND_URL` in backend `.env`
- [ ] Frontend API calls point to correct backend URL
- [ ] Frontend `.env` has correct `REACT_APP_API_URL`

### Optional Enhancements
- [ ] Set up SSL/TLS certificate
- [ ] Enable HTTPS for backend
- [ ] Set up Redis for caching (optional)
- [ ] Set up email service monitoring
- [ ] Set up application logging/monitoring

## 🚀 Deployment Options

### Option 1: Docker (Recommended)
Create `Dockerfile` in backend:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
```

Deploy with Docker Compose or cloud provider (AWS, Heroku, Railway, etc.)

### Option 2: Traditional Server
```bash
# SSH into server
cd /app/backend

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn server:app --host 0.0.0.0 --port 8000

# Or with gunicorn (production)
gunicorn -w 4 -k uvicorn.workers.UvicornWorker server:app --bind 0.0.0.0:8000
```

### Option 3: Cloud Platform (Heroku, Railway, Render)
Most cloud platforms auto-detect Python projects. Just:
1. Push code to Git
2. Set environment variables in platform dashboard
3. Specify startup command: `uvicorn server:app --host 0.0.0.0`

## 📋 Post-Deployment Tests

### Test Admin Login
```bash
curl -X POST http://localhost:8000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"your_admin_password"}'
```
Expected: `{"success": true, "token": "..."}`

### Test Booking Creation
```bash
curl -X POST http://localhost:8000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "6471234567",
    "address": "123 Main St",
    "service": "1",
    "date": "2025-12-15",
    "time": "10:00"
  }'
```

### Test Session Validation
```bash
curl -X POST http://localhost:8000/api/admin/validate-session \
  -H "Content-Type: application/json" \
  -d '{"token":"your_token_here"}'
```

### Test Pagination
```bash
curl http://localhost:8000/api/bookings?skip=0&limit=10
```

### Check Logs
Monitor application logs for errors:
```bash
tail -f /var/log/app.log
```

## 🔒 Security Checklist

- [ ] ADMIN_PASSWORD changed from default
- [ ] .env file not committed to Git
- [ ] CORS restricted to your domain
- [ ] MongoDB credentials are secure
- [ ] HTTPS enabled in production
- [ ] API rate limiting is active
- [ ] Session timeout is set (3600 seconds = 1 hour)
- [ ] Email credentials are app-specific passwords
- [ ] No hardcoded secrets in code

## 📞 Support

If deployment fails:
1. Check logs for specific error messages
2. Verify all environment variables are set
3. Verify database connection
4. Verify email credentials
5. Check firewall/network settings
6. Review `SECURITY_IMPROVEMENTS.md` for detailed changes

Good luck with deployment! 🚀
