# Production Deployment

This document outlines how to deploy the Kadoa application in a production environment.

## Overview

For a production setup, you will need to:
- Build the backend and frontend applications
- Set up a PostgreSQL database
- Configure environment variables
- Run database migrations
- Deploy services using a process manager

## Deployment Steps

1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/yourusername/kadoa.git
   cd kadoa
   yarn install
   ```

2. Build the applications:
   ```bash
   # Build backend
   cd be
   yarn build
   
   # Build frontend
   cd ../fe
   yarn build
   ```

3. Set up database:
   - Install PostgreSQL on your server
   - Create a database for the application
   - Run migrations: `yarn migrate`
   - Optionally run seed: `yarn seed` (first deployment only)

4. Configure environment variables in your `.env` file:
   ```
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/kadoa
   
   # Backend
   BE_PORT=3001
   JWT_SECRET=secure_jwt_secret_here
   JWT_EXPIRES_IN=7d
   OPENAI_API_KEY=your_openai_api_key
   
   # Frontend
   FE_PORT=3002
   NEXT_PUBLIC_API_URL=https://your-api-domain.com
   ```

5. Set up a process manager like PM2:
   ```bash
   npm install -g pm2
   
   # Start backend
   cd be
   pm2 start dist/main.js --name kadoa-backend
   
   # Start frontend
   cd ../fe
   pm2 start node_modules/next/dist/bin/next start --name kadoa-frontend
   ```

6. Configure a reverse proxy (like Nginx) to serve your application.

## Production Considerations

### Security

- Use strong passwords and secrets
- Set up HTTPS with a valid SSL certificate
- Configure proper firewalls to restrict access
- Store environment variables securely

### Scalability

- Consider using a load balancer for multiple instances
- Use a connection pool for database connections
- Implement caching where appropriate

### Monitoring

- Set up application monitoring using tools like PM2 Plus, Prometheus, or Grafana
- Configure log aggregation with ELK stack or similar

### Backups

- Set up regular database backups
- Consider using a managed PostgreSQL service for production 