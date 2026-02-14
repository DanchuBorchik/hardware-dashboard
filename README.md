# Hardware Dashboard

An interactive web-based roadmap for CPU architectures from Intel and AMD, featuring detailed information about processor generations, SKUs, and specifications.

## Features

- **Dual Vendor Support**: Switch between Intel and AMD processor roadmaps
- **Interactive Timeline**: Collapsible architecture groups organized by era
- **Advanced Filtering**: Filter by segment (desktop, mobile, server, embedded)
- **Search Functionality**: Quickly find specific architectures, SKUs, or brands
- **Tag-based Navigation**: Click legend items to filter content
- **GPU Support**: AMD Instinct accelerator information (CDNA architecture)
- **Detailed Specifications**: Expandable CPU/GPU spec tables for supported processors
- **Dark Theme**: Modern, readable interface with custom styling

## Project Structure

```
hardware_portal/
├── index.html           # Main HTML file
├── css/
│   └── styles.css      # All styles and theming
├── js/
│   └── script.js       # Application logic and data
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## How to Use

### Local Development

1. Simply open `index.html` in a web browser
2. No build step or dependencies required
3. Works completely offline once loaded

### Deployment Options

**GitHub Pages:**
1. Push to GitHub
2. Go to repository Settings → Pages
3. Select branch (main) and root folder
4. Your site will be live at `https://yourusername.github.io/hardware-dashboard/`

**Netlify:**
1. Drag and drop the project folder to [Netlify Drop](https://app.netlify.com/drop)
2. Or connect your GitHub repository for automatic deployments

**Any Static Host:**
- Upload all files to any web server
- No server-side processing required

## Adding New Hardware

To add new processors or architectures:

1. Open `js/script.js`
2. Find the appropriate data array:
   - `INTEL_DATA` for Intel CPUs
   - `AMD_DATA` for AMD CPUs
   - `AMD_GPU_DATA` for AMD GPUs
3. Add new entries following the existing format
4. Save and refresh the page

### Data Format Example

```javascript
{
  id: 'unique-id',
  arch: 'Architecture Name',
  color: '#hex-color',
  year: '2024',
  segment: 'client',
  defaultLinks: [{ label: 'Wikipedia', url: 'https://...' }],
  skus: [
    { name: 'SKU Name', desc: 'Description', tags: ['desktop', 'mobile'], brand: 'Brand' }
  ]
}
```

## Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with custom properties and animations
- **Vanilla JavaScript**: No frameworks or dependencies
- **Google Fonts**: DM Sans and JetBrains Mono

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers supported

## License

Personal project - feel free to fork and modify for your own use.

## Acknowledgments

Data sourced from public specifications, Wikipedia, and official vendor roadmaps.
