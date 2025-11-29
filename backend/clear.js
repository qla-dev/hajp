import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root directory where commands should be executed (no recursion)
const rootDir = path.resolve(__dirname);

// Commands to run in the root folder
const artisanCommands = [
    'php artisan config:clear',
    'php artisan cache:clear',
    'php artisan view:clear',
    'php artisan route:clear',
];

// Function to run commands in a given folder
function runCommandsInFolder(folderPath) {
    console.log(`Entering folder: ${folderPath}`);
    try {
        artisanCommands.forEach((command) => {
            console.log(`Running: ${command}`);
            execSync(command, { cwd: folderPath, stdio: 'inherit' });
        });
        console.log(`Finished in: ${folderPath}`);
    } catch (error) {
        console.error(`Error in folder ${folderPath}:`, error.message);
    }
    console.log('-------------------------------');
}

// Run commands once in the root folder
runCommandsInFolder(rootDir);
