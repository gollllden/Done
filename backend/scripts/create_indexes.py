"""
Simple script to create recommended MongoDB indexes.
Run:
  python backend/scripts/create_indexes.py
It reads MONGO_URL and DB_NAME from environment or you can pass them via args.
"""
import os
import sys
from pymongo import MongoClient


def main():
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME', 'golden_touch_prod')

    if not mongo_url:
        print('Error: MONGO_URL not set in environment.')
        sys.exit(1)

    client = MongoClient(mongo_url)
    db = client[db_name]

    print(f'Creating indexes on database: {db_name}')

    # bookings indexes
    db.bookings.create_index([('bookingId', 1)], unique=True)
    db.bookings.create_index([('email', 1)])
    db.bookings.create_index([('customerId', 1)])

    # sessions indexes
    db.sessions.create_index([('token', 1)], unique=True)
    # expireAfterSeconds requires a TTL index on a date field
    db.sessions.create_index([('expires_at', 1)], expireAfterSeconds=0)

    # status_checks
    db.status_checks.create_index([('timestamp', 1)])

    print('Indexes created successfully.')


if __name__ == '__main__':
    main()
