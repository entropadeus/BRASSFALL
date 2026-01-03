# How to Run BRASSFALL Locally

## Why You Need a Server

ES modules and import maps **require HTTP/HTTPS protocol**. Opening `index.html` directly (`file://`) will fail with CORS errors.

## Quick Start Options

### Option 1: Python (Easiest - Built-in)

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then open: `http://localhost:8000/index.html`

### Option 2: Node.js (http-server)

```bash
# Install globally (one time)
npm install -g http-server

# Run server
http-server -p 8000

# Or use npx (no install needed)
npx http-server -p 8000
```

Then open: `http://localhost:8000/index.html`

### Option 3: PHP (Built-in)

```bash
php -S localhost:8000
```

Then open: `http://localhost:8000/index.html`

### Option 4: VS Code Live Server

1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

### Option 5: Node.js (express - for development)

```bash
# Create server.js
cat > server.js << 'EOF'
const express = require('express');
const path = require('path');
const app = express();
app.use(express.static('.'));
app.listen(8000, () => console.log('Server: http://localhost:8000'));
EOF

# Run
node server.js
```

## Verify It's Working

1. Open browser console (F12)
2. Check for errors - should see no CORS or module resolution errors
3. Should see: `Initializing BRASSFALL game systems...`

## Common Issues

**Error**: `Failed to fetch dynamically imported module`
- **Fix**: Make sure you're using `http://localhost:8000/index.html`, not `file:///...`

**Error**: `Failed to resolve module specifier "three"`
- **Fix**: Make sure import map is loading (check Network tab)

**Port already in use**
- **Fix**: Use different port: `python -m http.server 8080`

## Recommended Setup

For development, I recommend **Python's http.server**:
- ✅ Built into Python (no install needed)
- ✅ Simple one-line command
- ✅ Works immediately
- ✅ No configuration needed

```bash
cd C:\Users\blona\OneDrive\Desktop\.coding\shootaz
python -m http.server 8000
```

Then open: `http://localhost:8000/index.html`

