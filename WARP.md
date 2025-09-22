# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview
This is a static HTML-based web portal for the PM Internship Scheme (Prime Minister's Internship Scheme) under the Ministry of Corporate Affairs, Government of India. The portal provides a landing page and main application interface for internship seekers to register, login, and apply for internships.

## Architecture & Structure

### Core Components
- **Landing Page** (`landing_pm_internship.html`): Marketing/promotional page with eligibility criteria, benefits, and registration/login modals
- **Portal Application** (`pm_internship_portal.html`): Main dashboard interface with internship browsing, application tracking, and user management

### Design System
- **Color Scheme**: 
  - Primary: `#2d4f93` (MCA Blue)
  - Accent: `#ff7a00` (Orange CTA)
  - Background: `#f5f7fb`
- **Typography**: Inter font family with system fallbacks
- **Layout**: CSS Grid and Flexbox for responsive design

### Key Features
1. **Authentication System**: Login and registration modals with form validation
2. **Internship Management**: Browse, filter, view details, and apply to internships
3. **Dashboard**: Stats display, quick actions, and navigation
4. **Responsive Design**: Mobile-first approach with breakpoints at 768px and 600px

## Development Commands

Since this is a static HTML project, no build system is required. Use these commands for development:

### Local Development
```bash
# Serve locally using Python (if available)
python -m http.server 8000

# Or using Node.js (if available)
npx http-server

# Or using PowerShell (Windows)
# Navigate to project directory and open files directly in browser
```

### File Management
```bash
# View project structure
Get-ChildItem -Recurse

# Check git status
git status

# View recent changes
git --no-pager log --oneline -10
```

### Code Validation
```bash
# HTML validation (requires online validator or tools)
# Consider using extensions like HTMLHint for VS Code
```

## Working with the Codebase

### File Relationships
- Both HTML files are standalone but share similar styling patterns
- `landing_pm_internship.html` references `pmis_auth.js` (external dependency not in repo)
- `pm_internship_portal.html` references `internships.js` (external dependency not in repo)

### Key Integration Points
- **Authentication**: Both files expect external auth module (`PMISAuth`)
- **Data Management**: Portal expects internship data management module (`internshipManager`)
- **Navigation**: Cross-page navigation via `window.location.href`

### Missing Dependencies
The project references external JavaScript files that are not present:
- `pmis_auth.js` - Authentication handling
- `internships.js` - Internship data and filtering logic

### Styling Approach
- Embedded CSS within `<style>` tags in each HTML file
- No external CSS dependencies
- Custom CSS variables for theming
- Responsive design with media queries

### Modal System
Both files implement modal dialogs for:
- User login/registration
- Internship details viewing
- Application forms

### Form Handling
- Client-side form validation
- Character counting for text areas
- Checkbox-based consent management
- Form submission via JavaScript event handlers

## Common Development Tasks

### Adding New Internship Fields
1. Update the internship details modal structure in `pm_internship_portal.html`
2. Modify the table headers and data rendering logic
3. Update filter options if new field is filterable

### Styling Changes
1. Update CSS variables in `:root` for color scheme changes
2. Modify responsive breakpoints in media queries
3. Test across different screen sizes

### Adding New Pages
1. Follow the existing HTML structure pattern
2. Include the government header bar and MCA branding
3. Maintain consistent styling and navigation patterns

### JavaScript Integration
1. Create missing JavaScript modules (`pmis_auth.js`, `internships.js`)
2. Implement actual API integration for authentication and data fetching
3. Add error handling and loading states

## Government Compliance Notes
- Maintains official Government of India branding
- Includes accessibility considerations in form labels
- Uses appropriate government color schemes and styling
- Implements proper consent mechanisms for Aadhaar usage

## Technology Stack
- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Styling**: CSS Grid, Flexbox, CSS Variables
- **Icons**: Unicode emojis and symbols
- **Fonts**: Google Fonts (Inter), system fallbacks
- **Version Control**: Git

## Recent Updates & New Features

### Enhanced Authentication System
- Comprehensive registration form with age validation
- Auto-login feature after registration
- Improved user session management
- Working logout functionality with confirmation

### Advanced Internship Management
- **New Filter System**: Location, Type (Paid/Unpaid), Top Companies
- **Match Score Algorithm**: Intelligent percentage matching based on user profile
- **Company Logo Swiper**: Animated horizontal carousel with partner companies
- **Enhanced Table**: Added company info, salary details, and match scores

### Comprehensive User Profile
- Complete profile form matching government standards
- Personal details, address, education, and skills sections
- Photo upload capability
- Form validation and data persistence

### Grievance Management System
- Submit complaints and feedback with priority levels
- Track grievance status and history
- Category-based complaint system
- Statistics dashboard for user grievances

### UI/UX Improvements
- **Interactive Icons**: Hover effects and animations on eligibility/benefits sections
- **Improved Navigation**: Fixed dropdown menus and user avatars
- **Responsive Design**: Enhanced mobile compatibility
- **Visual Enhancements**: Gradients, shadows, and smooth transitions

## Database Integration (Production Ready)

The application is structured for easy **Supabase integration**. See `SUPABASE_SETUP.md` for complete setup guide.

### Development vs Production
- **Development Mode**: Uses local dummy data in `apiService.js`
- **Production Mode**: Connects to Supabase with full CRUD operations
- **Easy Switch**: Change `isDevelopment: false` in `apiService.js`

### Database Schema
Complete SQL schema provided for:
- Users and authentication
- User profiles and personal data
- Internship listings and applications
- Grievance management
- Row Level Security (RLS) policies

## File Structure
```
pm-intern/
├── apiService.js              # API abstraction layer for database operations
├── pmis_auth.js              # Authentication module with session management
├── internships.js            # Internship management with filtering and matching
├── landing_pm_internship.html # Enhanced landing page with swiper and icons
├── pm_internship_portal.html  # Full-featured portal with all modules
├── test.html                 # Testing interface for development
├── WARP.md                   # This documentation
├── SUPABASE_SETUP.md         # Complete database integration guide
└── .git/                     # Version control
```

This is now a **production-ready application** with complete frontend functionality and database integration capabilities. The modular architecture allows for easy scaling and maintenance.
