import { exec } from 'child_process';
import fs from 'fs/promises';

const execAsync = (command) => new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
        if (error) reject(error);
        else resolve({ stdout, stderr });
    });
});

async function readPackageJson() {
    try {
        const data = await fs.readFile('package.json', 'utf8');
        return JSON.parse(data).dependencies || {};
    } catch (error) {
        console.error('Error reading package.json:', error.message);
        return {};
    }
}

function extractImports(content) {
    const importRegex = /import.*from\s+['"](.+)['"]/g;
    return Array.from(content.matchAll(importRegex), m => m[1]);
}

async function getImportsFromFile(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        return extractImports(content);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error.message);
        return [];
    }
}

async function installPackage(packageName) {
    if (packageName.startsWith('@evex/linejs/')) {
        console.log(`Skipping ${packageName} (part of the main package)`);
        return;
    }
    try {
        const { stdout } = await execAsync(`npm install ${packageName}`);
        console.log(`${packageName} installed successfully`);
        console.log(stdout);
    } catch (error) {
        console.error(`Error installing ${packageName}:`, error.message);
    }
}

async function main() {
    const targetFile = 'example.js';
    const existingDependencies = await readPackageJson();
    const imports = await getImportsFromFile(targetFile);

    const requiredPackages = new Set(
        imports.filter(imp => !imp.startsWith('.') && !Object.keys(existingDependencies).includes(imp))
    );

    console.log('Required packages:', Array.from(requiredPackages));

    for (const packageName of requiredPackages) {
        await installPackage(packageName);
    }

    console.log('All packages installed');
}

main().catch(error => console.error('Error in main execution:', error.message));