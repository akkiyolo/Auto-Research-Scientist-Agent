import { Client, Functions } from 'appwrite';

const client = new Client();

// FIX: Cast import.meta.env to handle missing Vite type definitions.
const env = (import.meta as any).env;

// Provide fallback values for environment variables to prevent the app from crashing on start.
// If these placeholders are used, Appwrite will return a specific error when an API call is made,
// which is handled gracefully by the UI. This is better than a blank screen.
const endpoint = env?.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1'; // Default Appwrite cloud endpoint
const projectId = env?.VITE_APPWRITE_PROJECT_ID || 'MISSING_PROJECT_ID'; // Placeholder that will cause a clear error
export const GENERATE_FUNCTION_ID = env?.VITE_APPWRITE_FUNCTION_ID || 'generate-research';

// Log a warning to the console if the project ID is missing, to help developers.
if (projectId === 'MISSING_PROJECT_ID') {
    console.warn(
`[Appwrite Configuration Warning]
Appwrite project ID is not configured. The application will load, but backend calls will fail.
Please create a .env.local file in the project root with your project details:

VITE_APPWRITE_ENDPOINT="YOUR_APPWRITE_ENDPOINT"
VITE_APPWRITE_PROJECT_ID="YOUR_PROJECT_ID"
VITE_APPWRITE_FUNCTION_ID="generate-research"

You can find these values in your Appwrite project's Settings page.
After creating the file, restart the development server.`
    );
}

client
    .setEndpoint(endpoint)
    .setProject(projectId);

export const functions = new Functions(client);