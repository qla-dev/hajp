// Add this to help debug prop type issues
import { LogBox } from 'react-native';

// Don't ignore errors - we want to see them all
LogBox.ignoreAllLogs(false);

// Override console.error to get more details
const originalError = console.error;
console.error = (...args) => {
  console.log('=== CONSOLE.ERROR CALLED ===');
  console.log('Stack trace:', new Error().stack);
  originalError(...args);
};

// Override console.warn similarly
const originalWarn = console.warn;
console.warn = (...args) => {
  console.log('=== CONSOLE.WARN CALLED ===');
  console.log('Stack trace:', new Error().stack);
  originalWarn(...args);
};

console.log('=== DEBUG MODE ENABLED ===');
