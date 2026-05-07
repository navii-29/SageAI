#!/usr/bin/env bash
set -o errexit

# We should already be in backend-simple directory due to Root Directory setting
echo "Starting from directory: $(pwd)"

# Verify main.py exists
if [[ -f "main.py" ]]; then
    echo "Found main.py in current directory"
else
    echo "ERROR: main.py not found in $(pwd)"
    ls -la
    exit 1
fi

# Set up Chrome for Testing paths
STORAGE_DIR=/opt/render/project/.render
CHROME_BIN="$STORAGE_DIR/chrome/chrome-linux64/chrome"
CHROMEDRIVER_BIN="$STORAGE_DIR/chromedriver/chromedriver-linux64/chromedriver"

# Export Chrome binary location for Selenium
export CHROME_BIN="$CHROME_BIN"
export CHROMEDRIVER_PATH="$CHROMEDRIVER_BIN"

echo "Chrome binary: $CHROME_BIN"
echo "ChromeDriver binary: $CHROMEDRIVER_BIN"

# Debug environment variables
echo "Environment variables:"
echo "CHROME_BIN=$CHROME_BIN"
echo "CHROMEDRIVER_PATH=$CHROMEDRIVER_PATH"

# Debug storage directory structure
echo "Storage directory structure:"
ls -la "$STORAGE_DIR" || echo "Storage directory not found"
if [[ -d "$STORAGE_DIR/chrome" ]]; then
    echo "Chrome directory contents:"
    find "$STORAGE_DIR/chrome" -type f || echo "No files in chrome directory"
fi
if [[ -d "$STORAGE_DIR/chromedriver" ]]; then
    echo "ChromeDriver directory contents:"
    find "$STORAGE_DIR/chromedriver" -type f || echo "No files in chromedriver directory"
fi

# Verify Chrome is available
if [[ -f "$CHROME_BIN" ]]; then
    echo "Chrome found at: $CHROME_BIN"
    "$CHROME_BIN" --version
else
    echo "ERROR: Chrome not found at $CHROME_BIN"
    ls -la "$STORAGE_DIR/chrome/" || echo "Chrome directory not found"
fi

# Verify ChromeDriver is available
if [[ -f "$CHROMEDRIVER_BIN" ]]; then
    echo "ChromeDriver found at: $CHROMEDRIVER_BIN"
    "$CHROMEDRIVER_BIN" --version
else
    echo "ERROR: ChromeDriver not found at $CHROMEDRIVER_BIN"
    ls -la "$STORAGE_DIR/chromedriver/" || echo "ChromeDriver directory not found"
fi

# Start the FastAPI application
# uvicorn main:app --host 0.0.0.0 --port $PORT
gunicorn -b 0.0.0.0:$PORT main:app
