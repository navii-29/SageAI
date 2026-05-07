#!/usr/bin/env bash
set -o errexit

# Save the original directory (should be backend-simple since Root Directory is set)
ORIGINAL_DIR=$(pwd)
echo "Starting from directory: $ORIGINAL_DIR"

# Verify we can see requirements.txt
if [[ -f "requirements.txt" ]]; then
    echo "Found requirements.txt in current directory"
else
    echo "ERROR: requirements.txt not found in $(pwd)"
    ls -la
    exit 1
fi

# Create storage directory for Chrome and ChromeDriver
STORAGE_DIR=/opt/render/project/.render
CHROME_DIR="$STORAGE_DIR/chrome"
CHROMEDRIVER_DIR="$STORAGE_DIR/chromedriver"

# Check if we have a complete Chrome installation
CHROME_BINARY="$CHROME_DIR/chrome-linux64/chrome"
CHROMEDRIVER_BINARY="$CHROMEDRIVER_DIR/chromedriver-linux64/chromedriver"

if [[ ! -f "$CHROME_BINARY" ]] || [[ ! -f "$CHROMEDRIVER_BINARY" ]]; then
  echo "...Downloading Chrome for Testing (latest stable)"
  
  # Clean up any partial downloads
  rm -rf $CHROME_DIR $CHROMEDRIVER_DIR
  
  mkdir -p $CHROME_DIR
  cd $CHROME_DIR
  
  # Get the latest stable Chrome version
  CHROME_VERSION=$(curl -s https://googlechromelabs.github.io/chrome-for-testing/LATEST_RELEASE_STABLE)
  echo "Latest Chrome version: $CHROME_VERSION"
  
  # Download Chrome for Testing
  echo "Downloading Chrome..."
  wget -O chrome-linux64.zip "https://storage.googleapis.com/chrome-for-testing-public/$CHROME_VERSION/linux64/chrome-linux64.zip"
  unzip chrome-linux64.zip
  rm chrome-linux64.zip
  
  # Verify Chrome was extracted
  if [[ ! -f "chrome-linux64/chrome" ]]; then
    echo "ERROR: Chrome binary not found after extraction"
    ls -la
    exit 1
  fi
  
  # Download matching ChromeDriver
  echo "Downloading ChromeDriver..."
  mkdir -p $CHROMEDRIVER_DIR
  cd $CHROMEDRIVER_DIR
  wget -O chromedriver-linux64.zip "https://storage.googleapis.com/chrome-for-testing-public/$CHROME_VERSION/linux64/chromedriver-linux64.zip"
  unzip chromedriver-linux64.zip
  rm chromedriver-linux64.zip
  
  # Verify ChromeDriver was extracted
  if [[ ! -f "chromedriver-linux64/chromedriver" ]]; then
    echo "ERROR: ChromeDriver binary not found after extraction"
    ls -la
    exit 1
  fi
  
  # Make ChromeDriver executable
  chmod +x chromedriver-linux64/chromedriver
  
  echo "Chrome and ChromeDriver downloaded successfully"
  echo "Chrome binary: $CHROME_BINARY"
  echo "ChromeDriver binary: $CHROMEDRIVER_BINARY"
  
  # Return to original directory
  cd "$ORIGINAL_DIR"
else
  echo "...Using Chrome from cache"
  echo "Chrome binary: $CHROME_BINARY"
  echo "ChromeDriver binary: $CHROMEDRIVER_BINARY"
fi

# Install Python dependencies (we're back in the original directory)
pip install -r requirements.txt