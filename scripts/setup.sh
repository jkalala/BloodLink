#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up BloodLink project...${NC}\n"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js 18 or later.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1)

if [ "$NODE_MAJOR_VERSION" -lt 18 ]; then
    echo -e "${RED}Node.js version 18 or later is required. Current version: $NODE_VERSION${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed. Please install npm.${NC}"
    exit 1
fi

# Install Expo CLI globally if not installed
if ! command -v expo &> /dev/null; then
    echo -e "${YELLOW}Installing Expo CLI...${NC}"
    npm install -g expo-cli
fi

# Install project dependencies
echo -e "\n${YELLOW}Installing project dependencies...${NC}"
npm install

# Install development dependencies
echo -e "\n${YELLOW}Installing development dependencies...${NC}"
npm install --save-dev @types/react @types/react-native @types/node

# Create necessary directories
echo -e "\n${YELLOW}Creating project directories...${NC}"
mkdir -p src/{assets,components,config,hooks,navigation,screens,services,store,types,utils}

# Create placeholder files
echo -e "\n${YELLOW}Creating placeholder files...${NC}"
touch src/assets/.gitkeep
touch src/components/.gitkeep
touch src/config/.gitkeep
touch src/hooks/.gitkeep
touch src/navigation/.gitkeep
touch src/screens/.gitkeep
touch src/services/.gitkeep
touch src/store/.gitkeep
touch src/types/.gitkeep
touch src/utils/.gitkeep

# Create .gitignore if it doesn't exist
if [ ! -f .gitignore ]; then
    echo -e "\n${YELLOW}Creating .gitignore file...${NC}"
    cat > .gitignore << EOL
# Dependencies
node_modules/
.pnp/
.pnp.js

# Testing
coverage/

# Production
build/
dist/
web-build/

# Expo
.expo/
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/

# macOS
.DS_Store
*.pem

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
*.log

# Firebase
google-services.json
GoogleService-Info.plist
firebase-debug.log
firebase-debug.*.log

# Temporary files
*.tmp
*.temp
EOL
fi

# Create initial git repository if not already initialized
if [ ! -d .git ]; then
    echo -e "\n${YELLOW}Initializing git repository...${NC}"
    git init
    git add .
    git commit -m "Initial commit: Project setup"
fi

echo -e "\n${GREEN}Setup completed successfully!${NC}"
echo -e "\nNext steps:"
echo -e "1. Create a Firebase project and add your configuration"
echo -e "2. Create an AfricasTalking account and get your API credentials"
echo -e "3. Copy .env.example to .env and fill in your credentials"
echo -e "4. Run 'npm start' to start the development server"
echo -e "\nHappy coding! 🚀" 