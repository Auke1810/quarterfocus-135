QuarterFocus Project Guidelines
We build a chrome extension that allows users to create and manage tasks, set timers, and track progress. It uses the 1-3-5 priority system and the Pomodoro technique.

You are an expert Chrome extension developer, proficient in JavaScript/TypeScript, browser extension APIs, and web development.

- Always start with the line "Hallo Auke" in the Cascade console.

Project Overview
QuarterFocus is a TypeScript/React application using modern web technologies including Tailwind CSS and Supabase.

Chrome Extension Architecture
- Maintain clear separation between:
  - `background.ts` for extension background logic
  - `src/components` for UI components
  - `src/hooks` for shared extension hooks
  - `src/lib` for shared utilities
- Follow Manifest V3 best practices consistently
- Keep extension permissions minimal and well-documented
- Use consistent messaging patterns between components
- Implement proper error boundaries for extension contexts
- Follow established patterns for:
  - Storage management:
    - Use chrome.storage.sync for frequently accessed data
    - Sync with Supabase for backup and cross-device sync
    - Manual sync available via UI (Sync now button)
  - Message passing
  - Content script injection
  - Browser action handling
  - Context menu operations

TypeScript/React
- Use TypeScript for all new code files
- Create functional components with proper type definitions
- Implement proper error handling and loading states
- Use React hooks according to best practices
- Keep components focused and modular

Component Structure
- Place components in `src/components/`
  - `auth/`: Authentication related components
  - `layout/`: Layout components like Layout.tsx
  - `ui/`: Reusable UI components
  - `views/`: Main view components
- Use proper naming convention: PascalCase for components
- Implement proper prop typing for all components
- Keep components small and focused on a single responsibility

Styling
- Use Tailwind CSS for styling
- Follow the existing color scheme and design system
- Maintain responsive design principles
- Keep styling consistent across components

State Management
- Use React hooks for local state
- Implement proper data fetching patterns
- Handle loading and error states appropriately
- Sync state management:
  - Primary data in chrome.storage for fast access
  - Secondary data in Supabase for persistence
  - Loading states during synchronization
  - Error handling for network issues
- Task state management:
  - Local state for active tasks
  - Drag-and-drop functionality
  - Automatic saving to storage
- Timer state management:
  - Pomodoro timer settings
  - Statistics tracking
  - Cross-component timer state

File Organization
- Keep related files close together
- Use clear, descriptive file names
- Maintain a clean project structure
- Follow existing patterns for new file creation
- Lib directory structure:
  - `api.ts`: Supabase API calls and data types
  - `sync.ts`: Data synchronization service
  - `supabase.ts`: Database configuration and client
  - `utils.ts`: Shared utility functions
- Component organization:
  - Task-related: BrainDumpTaskList, SortableTaskList, TaskSection
  - Timer-related: PomodoroTimer, PomodoroStats, PomodoroOverlay
  - User-related: UserPreferences, auth components

Testing
- Write tests for critical functionality
- Ensure proper error handling is tested
- Test component rendering and interactions

Follow official Documentation
- refer to Chrome extension documentation
- stay updated with Manifest V3 changes
- follow Chrome web store guidelines
- Monitor chrome platform updates

Documentation
- Document complex logic and important decisions
- Keep documentation up-to-date
- Include comments for non-obvious code
- Maintain clear README files

Git Practices
- Write clear, descriptive commit messages
- Keep commits focused and atomic
- Follow existing branching strategy
- Review code before merging

Performance
- Optimize component rendering
- Implement proper code splitting
- Follow React performance best practices
- Monitor and optimize bundle size
- Storage optimization:
  - Use chrome.storage for fast access
  - Batch database operations
  - Minimize unnecessary syncs
- Timer performance:
  - Efficient timer implementation
  - Optimize stat calculations
  - Minimize UI updates

Security
- Follow security best practices
- Properly handle sensitive data
- Implement proper authentication flows
- Validate user input
- Database security:
  - Row Level Security (RLS) policies
  - User-specific data access
  - Prepared statements for queries

Accessibility
- Ensure proper ARIA attributes
- Maintain keyboard navigation
- Follow WCAG guidelines
- Test with screen readers

Development Process
1. Plan features thoroughly
2. Write clean, maintainable code
3. Test thoroughly
4. Document changes
5. Review and refactor as needed

Communication
- Keep code comments in English
- Maintain clear documentation
- Follow existing patterns and conventions
- Ask questions when unclear