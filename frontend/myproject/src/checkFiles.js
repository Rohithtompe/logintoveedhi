// Run this in your terminal from the project root:
// cd frontend/myproject
// node src/checkFiles.js

const fs = require('fs');
const path = require('path');

const adminDashboardPath = path.join(__dirname, 'components', 'AdminDashboard');

console.log('Checking files in AdminDashboard folder...\n');

try {
  const files = fs.readdirSync(adminDashboardPath);
  console.log('Files found:');
  files.forEach(file => {
    console.log(`- ${file}`);
  });
  
  console.log('\nJSX files found:');
  const jsxFiles = files.filter(file => file.endsWith('.jsx'));
  jsxFiles.forEach(file => {
    console.log(`- ${file}`);
  });
} catch (error) {
  console.error('Error reading directory:', error.message);
}