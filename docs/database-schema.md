# Database Schema

## Tasks Table

| Column Name   | Data Type                 | Nullable | Default                      | Description |
|--------------|---------------------------|----------|------------------------------|-------------|
| id           | uuid                      | NO       | uuid_generate_v4()          | Primary key |
| user_id      | uuid                      | NO       | -                           | Reference to users table |
| text         | text                      | NO       | -                           | Task description |
| completed    | boolean                   | YES      | false                       | Task completion status |
| task_type    | text                      | NO       | -                           | Type of task (big/medium/small) |
| created_at   | timestamp with time zone  | NO       | timezone('utc'::text, now()) | Creation timestamp |
| updated_at   | timestamp with time zone  | NO       | timezone('utc'::text, now()) | Last update timestamp |
| info         | text                      | YES      | -                           | Additional task information/notes |
| position     | integer                   | YES      | -                           | Task position in list |
| scheduled_for| timestamp with time zone  | NO       | -                           | When the task is scheduled |

### Constraints & Details
- Primary Key: `id`
- Foreign Keys:
  - `user_id` references `users` table
- Indexes: TBD
- Triggers:
  - Automatically sets `created_at` and `updated_at`

### Notes
- `info` field is used to store task notes and subtasks
- `task_type` determines the task category (big/medium/small)
- `position` is used for ordering tasks within their type
- `scheduled_for` determines which view the task appears in (focus/tomorrow/week)

## User Settings Table

| Column Name    | Data Type                 | Nullable | Default                      | Description |
|---------------|---------------------------|----------|------------------------------|-------------|
| id            | uuid                      | NO       | uuid_generate_v4()          | Primary key |
| user_id       | uuid                      | NO       | -                           | Reference to users table |
| day_focus     | text                      | YES      | -                           | Focus text for today |
| tomorrow_focus| text                      | YES      | -                           | Focus text for tomorrow |
| week_focus    | text                      | YES      | -                           | Focus text for the week |
| created_at    | timestamp with time zone  | NO       | timezone('utc'::text, now()) | Creation timestamp |
| updated_at    | timestamp with time zone  | NO       | timezone('utc'::text, now()) | Last update timestamp |
| vision        | text                      | YES      | -                           | Long term vision of the user |
| core-value-1  | text                      | YES      | -                           | First core value of the user |
| core-value-2  | text                      | YES      | -                           | Second core value of the user |
| core-value-3  | text                      | YES      | -                           | Third core value of the user |

### Constraints & Details
- Primary Key: `id`
- Foreign Keys:
  - `user_id` references `users` table
- Triggers:
  - Automatically sets `created_at` and `updated_at`

### Notes
- Each user has one settings record
- Focus texts are used to display the user's focus/intention for different time periods
- All timestamps are stored in UTC

## Goal Types Table

| Column Name | Data Type                 | Nullable | Default                      | Description |
|------------|---------------------------|----------|------------------------------|-------------|
| id         | serial                    | NO       | -                           | Primary key |
| name       | text                      | NO       | -                           | Name of the goal type |
| description| text                      | YES      | -                           | Description of the goal type |
| created_at | timestamp with time zone  | NO       | timezone('utc'::text, now()) | Creation timestamp |
| updated_at | timestamp with time zone  | NO       | timezone('utc'::text, now()) | Last update timestamp |

### Constraints & Details
- Primary Key: `id`
- Predefined goal types:
  - year: Year goals (maximum of 3)
  - quarterly: 1 quarter milestone goal

### Notes
- This table stores the different types of goals

## Goals Table

| Column Name | Data Type                 | Nullable | Default                      | Description |
|------------|---------------------------|----------|------------------------------|-------------|
| id         | uuid                      | NO       | uuid_generate_v4()          | Primary key |
| user_id    | uuid                      | NO       | -                           | Reference to users table |
| goal_type_id| integer                   | NO       | -                           | Reference to goal types table |
| title      | text                      | NO       | -                           | Title of the goal |
| description| text                      | YES      | -                           | Description of the goal |
| start_date | timestamp with time zone  | NO       | -                           | Start date of the goal |
| end_date   | timestamp with time zone  | NO       | -                           | End date of the goal |
| completed  | boolean                   | NO       | false                       | Whether the goal is achieved |
| created_at | timestamp with time zone  | NO       | timezone('utc'::text, now()) | Creation timestamp |
| updated_at | timestamp with time zone  | NO       | timezone('utc'::text, now()) | Last update timestamp |

### Constraints & Details
- Primary Key: `id`
- Foreign Keys:
  - `user_id` references `users` table
  - `goal_type_id` references `goal_types` table

### Notes
- This table stores the goals of users

## Pomodoro Sessions Table

| Column Name      | Data Type                 | Nullable | Default                      | Description |
|-----------------|---------------------------|----------|------------------------------|-------------|
| id              | uuid                      | NO       | uuid_generate_v4()          | Primary key |
| task_id         | uuid                      | NO       | -                           | Reference to tasks table |
| user_id         | uuid                      | NO       | -                           | Reference to users table |
| started_at      | timestamp with time zone  | NO       | timezone('utc'::text, now()) | When the session started |
| completed_at    | timestamp with time zone  | YES      | -                           | When the session completed |
| duration_minutes| integer                   | NO       | -                           | Length of session in minutes |
| is_break        | boolean                   | NO       | false                       | Whether this is a break session |

### Constraints & Details
- Primary Key: `id`
- Foreign Keys:
  - `task_id` references `tasks` table
  - `user_id` references `users` table

### Notes
- Tracks both work and break sessions
- `completed_at` is NULL for active/incomplete sessions
- Standard pomodoro sessions are typically 25 minutes
- Break sessions are typically 5 minutes (short break) or 15-30 minutes (long break)

## Row Level Security (RLS)

All tables have Row Level Security enabled with the following policies:

- Users can only see their own data (SELECT)
- Users can only add their own data (INSERT)
- Users can only update their own data (UPDATE)
- Users can only delete their own data (DELETE)

## Indexes

### tasks
- user_id
- due_date
- priority
- completed

### goals
- user_id
- goal_type_id
- start_date
- end_date

### user_settings
- user_id

## Triggers

All tables have a trigger for automatically updating the `updated_at` column on changes.
