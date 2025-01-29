# QuarterFocus Project Guidelines

## Project Overview
QuarterFocus is a TypeScript/React application using modern web technologies including Tailwind CSS and Supabase.

## Chrome Extension Architecture
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
  - Storage management (chrome.storage)
  - Message passing
  - Content script injection
  - Browser action handling
  - Context menu operations

## Code Style Guidelines

### TypeScript/React
- Use TypeScript for all new code files
- Create functional components with proper type definitions
- Implement proper error handling and loading states
- Use React hooks according to best practices
- Keep components focused and modular

### Component Structure
- Place components in `src/components/`
- Use proper naming convention: PascalCase for components
- Implement proper prop typing for all components
- Keep components small and focused on a single responsibility

### Styling
- Use Tailwind CSS for styling
- Follow the existing color scheme and design system
- Maintain responsive design principles
- Keep styling consistent across components

### State Management
- Use React hooks for local state
- Implement proper data fetching patterns
- Handle loading and error states appropriately

### File Organization
- Keep related files close together
- Use clear, descriptive file names
- Maintain a clean project structure
- Follow existing patterns for new file creation

### Testing
- Write tests for critical functionality
- Ensure proper error handling is tested
- Test component rendering and interactions

### Documentation
- Document complex logic and important decisions
- Keep documentation up-to-date
- Include comments for non-obvious code
- Maintain clear README files

### Git Practices
- Write clear, descriptive commit messages
- Keep commits focused and atomic
- Follow existing branching strategy
- Review code before merging

### Performance
- Optimize component rendering
- Implement proper code splitting
- Follow React performance best practices
- Monitor and optimize bundle size

### Security
- Follow security best practices
- Properly handle sensitive data
- Implement proper authentication flows
- Validate user input

### Accessibility
- Ensure proper ARIA attributes
- Maintain keyboard navigation
- Follow WCAG guidelines
- Test with screen readers

## Development Process
1. Plan features thoroughly
2. Write clean, maintainable code
3. Test thoroughly
4. Document changes
5. Review and refactor as needed

## Communication
- Keep code comments in English
- Maintain clear documentation
- Follow existing patterns and conventions
- Ask questions when unclear
