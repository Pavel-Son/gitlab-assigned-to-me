# GitLab Assigned to Me Filter Extension

A Chrome extension that adds an "Assigned to Me" button to GitLab merge requests pages for quick filtering.

## Features

- 🎯 **Quick Filter**: One-click filtering of merge requests assigned to you
- 👤 **Auto-Detection**: Automatically detects your GitLab username
- 🎨 **GitLab Integration**: Seamlessly integrates with GitLab's interface
- 📱 **Responsive**: Works on desktop and mobile GitLab views
- 🌙 **Dark Theme**: Supports GitLab's dark theme

## Installation

### From Source (Developer Mode)

1. **Download or Clone** this repository to your local machine
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer Mode** by toggling the switch in the top right corner
4. **Click "Load unpacked"** and select the folder containing the extension files
5. **The extension is now installed** and ready to use

### Files Structure
```
gitlab-assigned-to-me/
├── manifest.json       # Extension configuration
├── content.js          # Main functionality script
├── styles.css          # Button styling
├── popup.html          # Extension popup interface
└── README.md           # This documentation
```

## Usage

1. **Navigate** to any GitLab merge requests page (e.g., `https://gitlab.com/group/project/-/merge_requests`)
2. **Look for** the "👤 Assigned to Me" button in the page controls area
3. **Click the button** to filter merge requests assigned to you
4. **The page will reload** with the filter applied, showing only your assigned merge requests

## How It Works

The extension:
- Detects when you're on a GitLab merge requests page
- Injects a styled "Assigned to Me" button into the page controls
- Automatically identifies your GitLab username from the page
- Applies the `assignee_username` filter when clicked
- Falls back to search input method if URL filtering doesn't work

## Supported GitLab Versions

This extension works with:
- GitLab.com (SaaS)
- GitLab self-hosted instances
- Both old and new GitLab UI versions

## Browser Compatibility

- ✅ Chrome (Manifest V3)
- ✅ Chromium-based browsers (Edge, Brave, etc.)
- ❌ Firefox (requires Manifest V2 adaptation)

## Troubleshooting

### Button Not Appearing
- Make sure you're on a GitLab merge requests page
- Check that the extension is enabled in `chrome://extensions/`
- Try refreshing the page

### Filter Not Working
- Ensure you're logged into GitLab
- Check that your username is correctly detected
- Try using GitLab's built-in assignee filter as a fallback

### Permission Issues
- The extension only requires access to the current tab
- No personal data is collected or transmitted

## Development

### Local Development
1. Make changes to the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes on a GitLab page

### File Descriptions
- **manifest.json**: Extension metadata and permissions
- **content.js**: Main script that runs on GitLab pages
- **styles.css**: CSS styling for the button
- **popup.html**: Extension popup with status and instructions

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the [MIT License](LICENSE).

## Version History

### v1.0 (Current)
- Initial release
- Basic "Assigned to Me" filtering functionality
- GitLab UI integration
- Responsive design support
