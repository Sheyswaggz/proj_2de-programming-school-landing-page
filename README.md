# Programming School Landing Page

A modern, responsive static landing page website for a programming school to showcase courses, provide essential information, and attract potential students. The page serves as the primary marketing tool and first point of contact for visitors interested in learning programming.

## Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Local Development Setup](#local-development-setup)
- [Development Guidelines](#development-guidelines)
- [Deployment](#deployment)
- [Contributing](#contributing)

## Project Overview

This landing page is designed to provide an engaging and informative experience for prospective students interested in learning programming. It features:

- Modern, responsive design that works across all devices
- Semantic HTML5 structure for better accessibility and SEO
- Modular CSS architecture for maintainable styling
- Interactive elements to enhance user engagement
- Integration with Unsplash API for dynamic imagery
- Analytics tracking for visitor insights

## Technology Stack

- **HTML5**: Semantic markup for content structure
- **CSS3**: Modern styling with modular architecture
- **JavaScript**: Vanilla JS for interactivity and API integration
- **GitHub Pages**: Static site hosting and deployment

## Project Structure

```
proj_2de-programming-school-landing-page/
├── index.html              # Main landing page
├── styles/                 # CSS modules
│   ├── base.css           # Base styles and CSS variables
│   ├── components.css     # Component-specific styles
│   └── animations.css     # Animation definitions
├── js/                    # JavaScript modules
│   ├── interactions.js    # User interaction handlers
│   ├── animations.js      # Animation logic
│   ├── unsplash.js       # Unsplash API integration
│   └── analytics.js      # Analytics tracking
├── robots.txt            # Search engine crawler instructions
├── sitemap.xml           # Site structure for SEO
├── .gitignore            # Git ignore patterns
└── README.md             # Project documentation

```

### CSS Architecture

The styles are organized into modular files for better maintainability:

- **base.css**: Contains CSS custom properties (variables), reset styles, and global base styles
- **components.css**: Component-specific styles for navigation, hero sections, cards, forms, etc.
- **animations.css**: Reusable animation keyframes and transition definitions

### JavaScript Modules

JavaScript functionality is split into focused modules:

- **interactions.js**: Handles user interactions like form submissions, navigation, and modal behavior
- **animations.js**: Manages scroll-based animations and dynamic visual effects
- **unsplash.js**: Integrates with Unsplash API for dynamic course imagery
- **analytics.js**: Tracks user behavior and page analytics

## Local Development Setup

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- A local web server (optional, but recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/proj_2de-programming-school-landing-page.git
   cd proj_2de-programming-school-landing-page
   ```

2. **Open the project**

   Option A - Direct file access:
   ```bash
   # Simply open index.html in your browser
   open index.html  # macOS
   start index.html # Windows
   xdg-open index.html # Linux
   ```

   Option B - Using a local server (recommended):
   ```bash
   # Using Python 3
   python -m http.server 8000

   # Using Node.js (with npx)
   npx http-server -p 8000

   # Using PHP
   php -S localhost:8000
   ```

3. **Access the site**

   Open your browser and navigate to:
   - Direct file: The file should open automatically
   - Local server: `http://localhost:8000`

### Development Workflow

1. Make changes to HTML, CSS, or JavaScript files
2. Refresh your browser to see changes (hard refresh with Ctrl+F5 or Cmd+Shift+R to clear cache)
3. Test across different browsers and device sizes
4. Commit changes following the contribution guidelines

## Development Guidelines

### Code Style

- Use semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`)
- Follow BEM methodology for CSS class naming where appropriate
- Use CSS custom properties for colors, spacing, and other design tokens
- Write vanilla JavaScript (no frameworks required)
- Keep JavaScript modules focused and single-purpose
- Add comments for complex logic or important sections

### Responsive Design

- Mobile-first approach: Design for mobile, then enhance for larger screens
- Test on multiple viewport sizes (320px, 768px, 1024px, 1440px+)
- Use CSS Grid and Flexbox for layouts
- Ensure touch targets are at least 44x44px for mobile usability

### Accessibility

- Use proper heading hierarchy (h1-h6)
- Include alt text for all images
- Ensure sufficient color contrast (WCAG AA minimum)
- Support keyboard navigation
- Use ARIA labels where appropriate

### Performance

- Optimize images before committing
- Minimize CSS and JavaScript for production
- Use async/defer for script loading
- Implement lazy loading for images where appropriate

## Deployment

This project is configured for deployment on GitHub Pages.

### Automatic Deployment

The site is automatically deployed when changes are pushed to the `main` branch.

### Manual Deployment Steps

1. **Configure GitHub Pages**
   - Go to your repository settings
   - Navigate to "Pages" section
   - Select "Deploy from a branch"
   - Choose `main` branch and `/ (root)` folder
   - Click Save

2. **Push your changes**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

3. **Access your site**
   - Your site will be available at: `https://yourusername.github.io/proj_2de-programming-school-landing-page/`
   - Initial deployment may take a few minutes

### Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file to the repository root with your domain name
2. Configure DNS settings with your domain provider
3. Update GitHub Pages settings to use your custom domain

## Contributing

We welcome contributions to improve the landing page. Please follow these guidelines:

### How to Contribute

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the development guidelines above
   - Test thoroughly across browsers and devices
   - Ensure code is clean and well-commented

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add: Brief description of your changes"
   ```

   Use conventional commit prefixes:
   - `Add:` for new features
   - `Fix:` for bug fixes
   - `Update:` for improvements to existing features
   - `Refactor:` for code refactoring
   - `Docs:` for documentation changes

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Submit a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Provide a clear description of your changes
   - Reference any related issues

### Code Review Process

- All submissions require review before merging
- Reviewers will check for code quality, functionality, and adherence to guidelines
- Address any requested changes promptly
- Once approved, maintainers will merge your PR

### Reporting Issues

If you find bugs or have suggestions:

1. Check if the issue already exists
2. Create a new issue with a clear title and description
3. Include steps to reproduce (for bugs)
4. Add screenshots if relevant

---

**License**: This project is open source and available under the MIT License.

**Questions?** Feel free to open an issue or reach out to the maintainers.
