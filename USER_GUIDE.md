# BOLTEST User Guide

Welcome to BOLTEST! This guide will help you get the most out of the test case management system and its powerful rich text editor.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Rich Text Editor Basics](#rich-text-editor-basics)
3. [Text Formatting](#text-formatting)
4. [Advanced Features](#advanced-features)
5. [Collaboration Tools](#collaboration-tools)
6. [Tips & Tricks](#tips--tricks)
7. [Troubleshooting](#troubleshooting)

---

## Getting Started

### First Time Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   - Copy `.env.example` to `.env.local`
   - Set your API URL: `REACT_APP_API_URL=your_api_url_here`

3. **Start the Application**
   ```bash
   npm start
   ```
   The app will open at `http://localhost:3000`

### Understanding the Interface

The BOLTEST interface has several key areas:
- **Toolbar**: Contains all formatting and insertion buttons
- **Editor Area**: Where you write and format your test case content
- **Sidebar**: Navigation and test case management (if in full app mode)

---

## Rich Text Editor Basics

### The Toolbar

The toolbar is organized into logical groups:

1. **Undo/Redo** - Reverse or repeat your last action
2. **Text Formatting** - Bold, Italic, Underline, Strikethrough, Inline Code, Clear
3. **Font Controls** - Font Family, Font Size, Increase/Decrease
4. **Paragraph Styles** - Normal, Title, Subtitle, Quote, Code
5. **Colors** - Text Color and Highlight Color pickers
6. **Script & Special** - Superscript, Subscript, Special Characters
7. **Alignment** - Left, Center, Right, Justify
8. **Indentation** - Indent, Outdent
9. **Lists** - Bullet, Numbered, Task Checkboxes
10. **Insert Content** - Tables, Images, Links, HR, etc.
11. **Media & Embed** - Videos, Files, Emojis
12. **Advanced** - Math, Code Blocks, Headings, Panels, Quotes
13. **Collaboration** - Comments, @Mentions, Track Changes
14. **Tools** - Find & Replace, Paste Plain Text, Spell Check, Word Count, Shortcuts

### Basic Operations

**To format text:**
1. Select the text you want to format
2. Click the appropriate toolbar button
3. The formatting is applied immediately

**To insert an element:**
1. Place your cursor where you want to insert
2. Click the insert button (e.g., Table, Image)
3. Fill in the modal dialog that appears
4. Click "Insert"

---

## Text Formatting

### Basic Formatting

- **Bold**: Select text and click **B** (or press Ctrl+B)
- **Italic**: Select text and click *I* (or press Ctrl+I)
- **Underline**: Select text and click <u>U</u> (or press Ctrl+U)
- **Strikethrough**: Select text and click ~~S~~
- **Inline Code**: Select text and click `Code` - great for variable names

### Font Customization

**Font Family**
Choose from 7 professional fonts:
- Segoe UI (default)
- Arial
- Helvetica
- Times New Roman
- Courier New
- Georgia
- Verdana

**Font Size**
Select a size from 12px to 28px, or use the +/- buttons to incrementally change size.

### Colors

**Text Color**
1. Select your text
2. Click the **🔤** (A) button
3. Choose from 10 colors
4. The color picker closes automatically

**Highlight Color**
1. Select your text
2. Click the **🔍** (highlighted A) button
3. Choose from 10 highlight colors
4. Select "Clear" to remove highlighting

### Paragraph Styles

Apply pre-defined styles to entire paragraphs:
- **Normal** - Standard paragraph text
- **Title** - Large heading (H1)
- **Subtitle** - Medium heading (H2)
- **Quote** - Blockquote styling
- **Code** - Preformatted code block

---

## Advanced Features

### Tables

**Creating a Table:**
1. Click the **⊞** (Table) button
2. Enter number of rows (1-20)
3. Enter number of columns (1-20)
4. Click "Insert"

The table will have:
- Header row with sample headers
- Sample data in cells
- Full borders and professional styling
- Azure DevOps compatible formatting

**Editing Tables:**
- Click any cell to edit its content
- Tables are fully editable after insertion

### Images

**Inserting Images:**
1. Click the **🖼** (Image) button
2. Enter the image URL (must start with https://)
3. Optionally enter alt text (recommended for accessibility)
4. Preview appears automatically
5. Click "Insert"

**Image Best Practices:**
- Always add alt text for accessibility
- Use stable URLs (not temporary links)
- Test the URL in preview before inserting

### Code Blocks

**For Multi-line Code:**
1. Click the **</>** (Code Block) button
2. Paste or type your code in the textarea
3. Click "Insert"

**For Inline Code:**
1. Select the text
2. Click the **`Code`** button
3. Text gets monospace font and gray background

### Lists

**Bullet Lists:**
- Click **•** to start a bullet list
- Press Enter for new items
- Click the button again to exit list mode

**Numbered Lists:**
- Click **1.** to start a numbered list
- Press Enter for new items
- Numbers update automatically

**Task Checklists:**
- Click **☐** to insert an unchecked task
- Click **☑️** to insert a checked task
- Perfect for test execution tracking

### Emojis

**Using the Emoji Picker:**
1. Click the **☺** (Emoji) button
2. Browse 70+ emojis in the grid
3. Click any emoji to insert it
4. The picker closes automatically

**Emoji Categories Available:**
- 😊 Smileys and emotions
- 👍 Gestures and hands
- 🎯 Objects and symbols
- 🧪 Test-related icons
- ⭐ Stars and decorations

---

## Collaboration Tools

### @Mentions

**Mentioning Team Members:**
1. Click the **@** button in the Collaboration group
2. Enter the username (e.g., john.smith)
3. Click "Mention @User"
4. The mention appears highlighted in blue

**Use Cases:**
- Assigning tasks: "Please review - @john.smith"
- Getting attention: "@jane.doe can you verify this?"
- Documentation: "Originally written by @bob.jones"

### Comments

**Adding Comments:**
1. Select the text you want to comment on
2. Click the **💬** (Comment) button
3. Enter your comment text
4. Click OK

**Viewing Comments:**
- Commented text has a dotted underline
- Hover over it to see the comment tooltip

### Track Changes

**Enabling Track Changes:**
1. Click the **✎** (Track Changes) button
2. Button highlights to show it's active
3. All new text you type will be highlighted
4. Click again to disable

**Use Cases:**
- Reviewing and editing test cases
- Showing proposed changes
- Collaborative editing

---

## Tips & Tricks

### Keyboard Shortcuts

Access the full list by clicking the **⌨** button, or use these common ones:
- **Ctrl+Z** - Undo
- **Ctrl+Y** - Redo
- **Ctrl+B** - Bold
- **Ctrl+I** - Italic
- **Ctrl+U** - Underline

### Paste as Plain Text

When copying from other sources (Word, web pages, etc.):
1. Click the **📋** (Paste Plain Text) button
2. The clipboard content is pasted without formatting
3. This prevents messy formatting issues

### Find & Replace

**Finding Text:**
1. Click the **🔍** (Find & Replace) button
2. Enter search text
3. Leave replacement empty
4. Click OK to find next occurrence

**Replacing Text:**
1. Click the **🔍** button
2. Enter search text
3. Enter replacement text
4. Click OK to replace all occurrences

### Special Characters

Insert mathematical and special symbols:
1. Click the **Ω** (Special Characters) button
2. Choose from: © ® € ° ± × ÷ ≠ ≤ ≥ ∞ √ ∑ ∫ π Ω
3. Copy and paste the character you need

### Word Count

Check your document statistics:
1. Click the **123** (Word Count) button
2. See word count and character count
3. Great for tracking test case documentation length

---

## Troubleshooting

### Common Issues

**Problem: Toolbar buttons not responding**
- **Solution**: Click inside the editor area first to focus it
- **Solution**: Refresh the page if buttons remain unresponsive

**Problem: Formatting not applying**
- **Solution**: Make sure text is selected before clicking format buttons
- **Solution**: Try Ctrl+Z to undo and try again

**Problem: Can't paste images**
- **Solution**: Use the Image button and enter URL instead
- **Solution**: Images must be hosted online (not from local computer)

**Problem: Colors not showing**
- **Solution**: Make sure you've selected text first
- **Solution**: Check if another color is already applied

**Problem: Table too large**
- **Solution**: Click inside a cell and delete rows/columns manually
- **Solution**: Start over with fewer rows/columns

### Performance Tips

1. **Large Documents**: Break very long test cases into smaller sections
2. **Images**: Use optimized, web-ready images (not huge files)
3. **Tables**: Keep tables under 20x20 for best performance
4. **Formatting**: Use Clear Formatting (✖) to reset if document feels slow

### Getting Help

If you encounter issues:
1. Check this guide first
2. Click the **⌨** button for keyboard shortcuts help
3. Hover over any toolbar button to see its tooltip
4. Check the project documentation files:
   - BOLTEST_TOOLBAR_FEATURES.md
   - TOOLBAR_QUICK_REFERENCE.md
   - COMPLETE_TOOLBAR_FINAL.md

---

## Azure DevOps Compatibility

All formatting in BOLTEST is designed to work with Azure DevOps:

✅ **Compatible Features:**
- All text formatting (bold, italic, colors, etc.)
- Tables with full styling
- Images from URLs
- Code blocks with syntax preservation
- Lists (bullet, numbered, tasks)
- Links and embeds

✅ **Preserved on Copy/Paste:**
- Text colors and highlights
- Font sizes and families
- All structural elements
- @Mentions (as text)
- Task checkboxes (as emoji)

---

## Best Practices

### Writing Test Cases

1. **Use Headings** for major sections (Expected Results, Prerequisites, etc.)
2. **Use Lists** for step-by-step instructions
3. **Use Task Checkboxes** to track execution progress
4. **Use Code Blocks** for SQL queries or API requests
5. **Use Tables** for test data or comparison matrices
6. **Use @Mentions** to assign or request reviews
7. **Use Colors** sparingly for emphasis (red for errors, green for success)

### Organizing Content

1. **Horizontal Rules** - Separate major sections
2. **Info Panels** - Highlight important notes or warnings
3. **Indentation** - Show hierarchical relationships
4. **Quotes** - Document requirements or specifications
5. **Images** - Include screenshots of expected results

### Collaboration

1. **@Mention** specific team members for assignments
2. **Track Changes** when reviewing others' work
3. **Comments** to ask questions or provide context
4. **Clear Formatting** before pasting from external sources

---

## Updates and Features

This guide covers BOLTEST with the complete 40+ feature toolbar. Recent additions include:

- ✅ Inline Code button
- ✅ Second Task Checkbox (☑️)
- ✅ @Mention button
- ✅ Keyboard Shortcuts help modal
- ✅ Paste as Plain Text
- ✅ Enhanced accessibility (ARIA labels)

For the latest updates, check the project's documentation files.

---

**Last Updated**: January 2026  
**Version**: Complete Toolbar Implementation

*Happy Testing with BOLTEST! 🚀*
