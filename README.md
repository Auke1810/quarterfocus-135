# 1-3-5 Todo List with Pomodoro Timer

A productivity-focused web application that combines the 1-3-5 task management method with an integrated Pomodoro timer.

## Features

### 1-3-5 Task Management
- Organize tasks into three categories:
  - 1 Big task (high priority)
  - 3 Medium tasks (medium priority)
  - 5 Small tasks (quick wins)
- Task completion tracking with checkboxes
- Easy task deletion
- Daily task reset functionality

### Pomodoro Timer
- 50-minute work sessions
- 10-minute break intervals
- Visual progress tracking
- Start, pause, and reset controls
- Session completion notifications

### Authentication
- GitHub OAuth integration
- Secure user data storage
- Persistent task management across sessions

### Technical Stack
- React + TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Supabase for backend and authentication
- ShadcnUI component library

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run the development server: `npm run dev`

## Database Schema

### Tasks Table
- id: string (primary key)
- user_id: string (foreign key)
- text: string
- task_type: string (big/medium/small)
- completed: boolean
- created_at: timestamp
- updated_at: timestamp

### Pomodoro Sessions Table
- id: string (primary key)
- user_id: string (foreign key)
- task_id: string (foreign key)
- duration_minutes: number
- started_at: timestamp
- completed_at: timestamp
- is_break: boolean
