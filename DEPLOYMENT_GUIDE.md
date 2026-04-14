# Deploy SPEAKS

## Frontend on Vercel
1. Import the root project folder into Vercel.
2. Framework preset: Vite.
3. Build command: npm run build
4. Output directory: dist
5. Add environment variable:
   - VITE_API_URL=https://YOUR-BACKEND-URL.onrender.com
6. Deploy.

## Backend on Render
1. Import the repository or upload the backend folder.
2. Use backend/render.yaml or create a Web Service manually.
3. Add environment variables:
   - PORT=5000
   - JWT_SECRET=your-long-random-secret
   - DB_HOST=your-mysql-host
   - DB_PORT=3306
   - DB_USER=your-mysql-user
   - DB_PASSWORD=your-mysql-password
   - DB_NAME=your-database-name
   - FRONTEND_URL=https://YOUR-FRONTEND.vercel.app
4. Deploy.

## Database
- Import backend/speaks_app.sql into your MySQL database.
- Make sure the users.password column can store bcrypt hashes.

## Local testing
Frontend .env
- VITE_API_URL=http://localhost:5000

Backend .env
- set your local MySQL values
- FRONTEND_URL=http://localhost:5173
