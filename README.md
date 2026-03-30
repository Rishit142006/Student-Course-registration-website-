# Student Course Registration System

A full-stack web application for students to register, log in, view available courses, and enroll online. Built with React, Express, and Firebase.

## Features

- **Secure Authentication**: Integrated Google Login via Firebase Auth.
- **Student Dashboard**: 
  - Browse real-time course listings.
  - View course details (credits, instructor, capacity).
  - Enroll/Unenroll with instant updates.
- **Admin Dashboard**:
  - Create, manage, and delete courses.
  - Monitor real-time enrollment statistics.
- **Full-Stack API**: Express.js backend providing GET and POST endpoints for course management.
- **Real-time Database**: Firestore integration for live updates across all clients.

## Tech Stack

- **Frontend**: React 19, Tailwind CSS 4, Lucide Icons, Framer Motion, Sonner (Toasts).
- **Backend**: Node.js, Express.js.
- **Database & Auth**: Firebase Firestore, Firebase Authentication.
- **Build Tool**: Vite.

## Getting Started

### Prerequisites

- Node.js (v18+)
- Firebase Project

### Setup

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd student-course-registration
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Firebase Configuration**:
   Create a `firebase-applet-config.json` in the root directory with your Firebase project credentials:
   ```json
   {
     "apiKey": "YOUR_API_KEY",
     "authDomain": "YOUR_AUTH_DOMAIN",
     "projectId": "YOUR_PROJECT_ID",
     "appId": "YOUR_APP_ID",
     "firestoreDatabaseId": "YOUR_DATABASE_ID"
   }
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

## Deployment

This app is designed to be deployed to Cloud Run or any Node.js environment.

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Start the production server**:
   ```bash
   npm start
   ```

## License

Apache-2.0
