# Quick Start Guide - BRASSFALL Modular Version

## Setup

1. **Use the new entry point**: `index_new.html` (or rename it to `index.html`)

2. **Serve via HTTP**: ES6 modules require HTTP, not file:// protocol
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (http-server)
   npx http-server -p 8000
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**: Navigate to `http://localhost:8000/index_new.html`

## File Structure

```
shootaz/
├── index_new.html          # New entry point (use this)
├── index.html              # Original file (preserved)
├── js/
│   └── main.js            # Main game initialization
└── [other modules...]
```

## Module Verification

Open browser console and run:
```javascript
// Verify all modules can be imported
import('./js/verify-modules.js').then(m => m.verifyModules());
```

Or check `window.game` after page loads:
```javascript
// Should show Game instance
console.log(window.game);
```

## Troubleshooting

### Module Import Errors

**Error**: `Failed to fetch dynamically imported module`
- **Solution**: Make sure you're serving via HTTP, not opening file:// directly

**Error**: `THREE is not defined`
- **Solution**: Check that Three.js CDN scripts load before `js/main.js`

**Error**: `Cannot find module`
- **Solution**: Check file paths match exactly (case-sensitive)

### Common Issues

1. **CORS Errors**: Use a local HTTP server, not file://
2. **Missing Dependencies**: Ensure all CDN scripts load before modules
3. **Import Paths**: Use `.js` extension in imports
4. **Browser Support**: Requires ES6 module support (modern browsers)

## Development Workflow

1. **Edit modules** in `js/` directories
2. **Refresh browser** to see changes
3. **Check console** for errors
4. **Use `window.game`** for debugging

## Next Steps

- Complete weapon implementations
- Integrate zombie spawning
- Implement wave system
- Add shooting mechanics
- Test and optimize

## Notes

- Original `index.html` is preserved for reference
- All modules use ES6 imports/exports
- Some systems still need full integration
- See `REFACTORING.md` for detailed documentation

