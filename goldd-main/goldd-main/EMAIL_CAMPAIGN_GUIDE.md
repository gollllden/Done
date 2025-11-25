# 📧 Automated Email Campaign System

## Overview
Your Golden Touch Cleaning Services application now has a fully automated email marketing campaign system that sends promotional emails to all registered customers twice a week!

## 🎯 Features

### Automated Scheduling
- **Monday Morning Campaign**: Sent every Monday at 9:00 AM
- **Friday Morning Campaign**: Sent every Friday at 9:00 AM
- Completely automatic - no manual intervention needed!

### Email Templates

#### Monday Campaign
- **Subject**: "Start Your Week Fresh - Golden Touch Cleaning Services"
- **Theme**: Blue header, professional Monday motivation
- **Content**: 
  - Services highlight
  - Mobile service reminder
  - Book Now call-to-action button
  - Contact information

#### Friday Campaign
- **Subject**: "Weekend Ready? Get Your Cleaning Done - Golden Touch"
- **Theme**: Green header, weekend-focused
- **Content**:
  - Weekend preparation message
  - Why Choose Us section
  - Book Now for the Weekend CTA
  - Contact information

### Target Audience
- All customers who have made at least one booking
- Only sends to customers who provided email addresses
- Automatically excludes duplicate emails

## 🔧 Technical Details

### Backend Files
- `/app/backend/email_campaign.py` - Campaign logic and email templates
- `/app/backend/server.py` - Scheduler integration

### Scheduler
- Uses APScheduler (BackgroundScheduler)
- Timezone: UTC
- Schedule: 
  - Monday: `CronTrigger(day_of_week='mon', hour=9, minute=0)`
  - Friday: `CronTrigger(day_of_week='fri', hour=9, minute=0)`

### Database Integration
- Fetches unique customer emails from MongoDB `bookings` collection
- Filters out null/empty email addresses
- Retrieves customer names for personalization

## 🎮 API Endpoints

### Check Campaign Status
```bash
GET /api/campaigns/status
```
**Response:**
```json
{
  "campaigns": [
    {
      "id": "monday_campaign",
      "name": "Monday Morning Email Campaign",
      "next_run": "2025-11-24T09:00:00+00:00"
    },
    {
      "id": "friday_campaign",
      "name": "Friday Morning Email Campaign",
      "next_run": "2025-11-28T09:00:00+00:00"
    }
  ]
}
```

### Manual Campaign Trigger (Testing)
```bash
POST /api/campaigns/trigger?campaign_type=monday
POST /api/campaigns/trigger?campaign_type=friday
```
**Response:**
```json
{
  "success": true,
  "message": "Monday campaign triggered successfully"
}
```

## 📊 Logs

### View Campaign Activity
```bash
tail -f /var/log/supervisor/backend.err.log | grep -i campaign
```

### Sample Log Output
```
2025-11-21 10:31:51,901 - email_campaign - INFO - Starting monday email campaign...
2025-11-21 10:31:51,906 - email_campaign - INFO - Found 3 unique customers for email campaign
2025-11-21 10:31:52,616 - email_campaign - INFO - Campaign email sent to customer@example.com
2025-11-21 10:31:55,453 - email_campaign - INFO - Monday campaign complete: 3 sent, 0 failed
```

## 🎨 Customization

### Changing Schedule Time
Edit `/app/backend/server.py`:
```python
# Change from 9:00 AM to 8:00 AM
scheduler.add_job(
    run_monday_campaign,
    CronTrigger(day_of_week='mon', hour=8, minute=0),  # Changed to 8
    ...
)
```

### Modifying Email Content
Edit `/app/backend/email_campaign.py`:
- `get_monday_email_template()` - Monday email content
- `get_friday_email_template()` - Friday email content

### Adding More Campaign Days
```python
# Add Wednesday campaign
scheduler.add_job(
    run_wednesday_campaign,
    CronTrigger(day_of_week='wed', hour=9, minute=0),
    id='wednesday_campaign',
    name='Wednesday Email Campaign'
)
```

## ⚠️ Important Notes

1. **Email Rate Limiting**: The system includes a 0.5-second delay between emails to avoid overwhelming Gmail SMTP
2. **Email Requirements**: Only customers with valid email addresses receive campaigns
3. **Timezone**: Scheduler runs in UTC. Adjust times accordingly for your local timezone
4. **SMTP Credentials**: Campaigns use the same Gmail SMTP credentials configured in `.env`

## 🔍 Troubleshooting

### Campaign Not Sending
1. Check scheduler status: `curl http://localhost:8001/api/campaigns/status`
2. Check logs: `tail -f /var/log/supervisor/backend.err.log`
3. Verify SMTP credentials in `/app/backend/.env`
4. Ensure backend service is running: `sudo supervisorctl status backend`

### No Customers Found
- Verify bookings have email addresses
- Check MongoDB connection
- View customer count in logs

### Email Delivery Issues
- Check Gmail SMTP credentials
- Verify Gmail App Password is correct
- Check for email bounce/spam issues in Gmail account

## 📈 Performance

- **Campaign Duration**: ~0.5 seconds per email
- **Average Time**: For 100 customers ≈ 50 seconds
- **Memory Impact**: Minimal (background scheduler)
- **Database Queries**: 1 query per campaign run

## 🚀 Next Steps

1. **Monitor First Campaign**: Check logs on next Monday/Friday at 9 AM
2. **Review Email Deliverability**: Check Gmail for successful sends
3. **Customer Feedback**: Monitor booking rates after campaigns
4. **A/B Testing**: Try different email content and measure response

## 📞 Need Help?

Check the logs or manually trigger a test campaign:
```bash
curl -X POST "http://localhost:8001/api/campaigns/trigger?campaign_type=monday"
```

Your automated marketing system is now live and will run every Monday and Friday morning! 🎉
