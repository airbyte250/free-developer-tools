# WorkSpace - Company Management Platform

A powerful, all-in-one company workspace application built with React, TypeScript, and Tailwind CSS. Manage your entire team, projects, tasks, communication, and more from a single beautiful interface.

## Features

### Core Modules
- **Dashboard** - Real-time overview with stats, charts, activity feed, and quick actions
- **Projects & Tasks** - Kanban board and list views with priorities, deadlines, tags, and team assignment
- **Team Management** - Employee directory with departments, roles, search, grid/list views
- **Chat & Messaging** - Real-time team communication with public/private channels and reactions
- **Activity Feed** - Complete activity tracking - see who did what, when, with filters
- **Calendar** - Interactive calendar with events, meetings, deadlines, and attendee management
- **Time Tracking** - Track work hours with timer, manual entries, and weekly analytics
- **Reports & Analytics** - Comprehensive charts for tasks, revenue, productivity, budget, and department performance
- **Documents** - File management with upload, share, organize in folders
- **Attendance & Leaves** - Track daily attendance, manage leave requests with approve/reject workflow
- **Goals & OKRs** - Set company, team, and personal goals with key results tracking
- **Settings** - Workspace configuration, member management, security, notifications, and appearance

### UI/UX Features
- Modern, clean design inspired by ClickUp, Monday.com, and Notion
- Responsive sidebar navigation with collapse/expand
- Global search with keyboard shortcut
- Notification center with real-time alerts
- User profile dropdown
- Beautiful charts and data visualizations (Recharts)
- Grid and list view toggles for most modules
- Color-coded priorities, statuses, and badges

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite 8** - Build tool
- **Tailwind CSS 4** - Utility-first styling
- **React Router 7** - Client-side routing
- **Recharts** - Charts and data visualization
- **Lucide React** - Beautiful icons
- **date-fns** - Date utilities

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
  components/
    layout/         # Sidebar, Header
  data/
    mockData.ts     # Sample data for all modules
  pages/
    Dashboard.tsx   # Main dashboard
    Projects.tsx    # Project & task management
    Team.tsx        # Team directory
    Chat.tsx        # Messaging system
    Activity.tsx    # Activity feed
    CalendarPage.tsx # Calendar & events
    TimeTracking.tsx # Time tracker
    Reports.tsx     # Analytics & reports
    Documents.tsx   # File management
    Attendance.tsx  # Attendance & leaves
    Goals.tsx       # Goals & OKRs
    Settings.tsx    # Workspace settings
  types/
    index.ts        # TypeScript interfaces
  App.tsx           # Main app with routing
  main.tsx          # Entry point
```

## License

MIT
