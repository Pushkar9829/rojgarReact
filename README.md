# RojgaAlert Admin Panel

A modern React.js admin panel for managing the RojgaAlert application. Built with React, Vite, Tailwind CSS, and connected to the Node.js backend API.

## Features

- 🔐 **OTP-based Authentication** - Secure login with mobile number and OTP
- 📊 **Dashboard** - Overview statistics and recent activity
- 💼 **Jobs Management** - Full CRUD operations for job postings
- 📋 **Schemes Management** - Full CRUD operations for government schemes
- 👥 **Users Management** - View and filter users
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS
- ⚡ **Fast Performance** - Built with Vite for lightning-fast development

## Installation

1. Navigate to the admin panel directory:
```bash
cd admin-panel
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional, defaults to localhost:5000):
```env
VITE_API_URL=https://api.tatsatinfotech.com/api
```

4. Make sure the backend server is running (see backend README)

5. Start the development server:
```bash
npm run dev
```

The admin panel will be available at `http://localhost:3001`

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
admin-panel/
├── src/
│   ├── components/
│   │   ├── Layout.jsx          # Main layout with navigation
│   │   └── ProtectedRoute.jsx  # Route protection wrapper
│   ├── context/
│   │   └── AuthContext.jsx     # Authentication context
│   ├── pages/
│   │   ├── Login.jsx           # Login page
│   │   ├── Dashboard.jsx       # Dashboard with stats
│   │   ├── Jobs.jsx            # Jobs management
│   │   ├── Schemes.jsx         # Schemes management
│   │   └── Users.jsx           # Users list
│   ├── services/
│   │   └── api.js              # API service layer
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Usage

### Login
1. Enter your admin mobile number
2. Click "Send OTP"
3. Enter the OTP received
4. Click "Verify OTP" to login

### Dashboard
- View overall statistics (users, jobs, schemes)
- See recent activity
- Monitor active/inactive counts

### Jobs Management
- View all jobs in a table
- Create new jobs with all required fields
- Edit existing jobs
- Delete jobs
- Filter and sort jobs

### Schemes Management
- View all schemes
- Create new schemes
- Edit existing schemes
- Delete schemes
- Manage scheme details

### Users Management
- View all registered users
- Filter by role, state, or status
- See user profile information

## API Integration

The admin panel connects to the backend API at `https://api.tatsatinfotech.com/api` (or the URL specified in `.env`).

All API calls are handled through the `src/services/api.js` file, which includes:
- Automatic token injection
- Error handling
- Request/response interceptors

## Technologies

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **React Hot Toast** - Notifications

## Notes

- Make sure you have an admin account in the database with ADMIN role
- The OTP will be logged to the console in development (configure Twilio for production)
- All routes are protected except `/login`
- Token is stored in localStorage