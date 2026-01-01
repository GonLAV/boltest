# BOLTEST Frontend

A modern React frontend for test case management and Azure DevOps TFS sync with a professional rich text editor.

## ✨ Features

### Rich Text Editor
BOLTEST includes a comprehensive rich text editor with 40+ formatting and insertion options:

- **Text Formatting**: Bold, Italic, Underline, Strikethrough, Inline Code
- **Font Controls**: Font Family (7 options), Font Size (12-28px), Increase/Decrease
- **Paragraph Styles**: Normal, Title, Subtitle, Quote, Code
- **Colors**: 10 text colors, 10 highlight colors
- **Advanced Formatting**: Superscript, Subscript, Special Characters
- **Alignment**: Left, Center, Right, Justify
- **Lists**: Bullet, Numbered, Task Checkboxes (☐ ☑️)
- **Insert Elements**: Tables, Images, Links, Videos, Files, Emojis
- **Content Blocks**: Headings, Code Blocks, Quotes, Info Panels, Horizontal Rules
- **Collaboration**: Comments, @Mentions, Track Changes
- **Tools**: Find & Replace, Paste as Plain Text, Spell Check, Word Count, Keyboard Shortcuts Help

All features are **Azure DevOps compatible** and styled with a cosmic theme.

## Getting Started

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the development server:
   ```sh
   npm start
   ```
3. Access the application at `http://localhost:3000`

## Project Structure

- `public/` — Static assets
- `src/` — Source code
  - `features/` — Feature modules (testCases, dashboard, stories, etc.)
  - `shared/` — Shared components, services, hooks, utils
  - `app/` — Application-level configuration
- `.env.example` — Environment variable example

## Tech Stack
- React 18
- React Router DOM
- Axios for API calls
- Tailwind CSS for styling
- TypeScript for type safety

## API Configuration
- Set your backend API URL in `.env` or `.env.local` using `REACT_APP_API_URL`.

## Documentation

For detailed information about the Rich Text Editor:
- See [BOLTEST_TOOLBAR_FEATURES.md](./BOLTEST_TOOLBAR_FEATURES.md) for complete feature documentation
- See [TOOLBAR_QUICK_REFERENCE.md](./TOOLBAR_QUICK_REFERENCE.md) for quick reference guide
- See [QUICKSTART.md](./QUICKSTART.md) for getting started guide

## Keyboard Shortcuts

- **Ctrl+B** - Bold
- **Ctrl+I** - Italic  
- **Ctrl+U** - Underline
- **Ctrl+Z** - Undo
- **Ctrl+Y** - Redo

Click the ⌨ button in the editor toolbar for more shortcuts.

## Contributing

When making changes:
1. Follow existing code style
2. Test all changes thoroughly
3. Update documentation as needed
4. Run `npm run build` to verify production build

## License

All rights reserved.
