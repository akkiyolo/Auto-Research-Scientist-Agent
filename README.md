# Auto-Research Scientist Agent (Appwrite Edition)

[![Deploy with Appwrite](https://appwrite.io/images/deploy.svg)](https://cloud.appwrite.io/new/project?template=https%3A%2F%2Fgithub.com%2FYOUR_USERNAME%2FYOUR_REPO_NAME)
[![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Gemini-blueviolet.svg)](https://deepmind.google/technologies/gemini/)

An AI-powered agent that automates the scientific research process. It takes a research topic, analyzes relevant academic papers, generates a comparative summary, and creates a baseline Jupyter notebook to kickstart experimentation. This version is built to run on the Appwrite backend-as-a-service platform.

---

## 🚨 Important Security Notice
If you have accidentally exposed your Google Gemini API Key (for example, by committing it to a public repository or sharing it in an issue), **you must revoke it immediately** in your [Google AI Studio dashboard](https://aistudio.google.com/app/apikey) and generate a new one. Exposed keys can be abused, leading to unexpected charges or service disruption. Always store keys securely as environment variables.

---

## 🚀 Core Features

-   **Automated Research Briefs:** Generates a detailed summary of any scientific topic, explaining core concepts, importance, and recent advancements.
-   **Comparative Analysis:** Creates a side-by-side comparison table of different papers or methodologies, highlighting key findings, datasets, and techniques.
-   **Code Generation:** Automatically writes a complete, well-commented Python baseline in a Jupyter Notebook format using PyTorch or TensorFlow to start experiments immediately.
-   **Interactive UI:** A modern, responsive, and dark-mode interface with a tabbed view to easily switch between the brief, comparison table, and notebook code.
-   **Appwrite Backend:** Powered by a secure and scalable Appwrite Function for backend logic.

## 🛠️ Tech Stack

-   **Frontend:** [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/)
-   **Backend:** [Appwrite Functions](https://appwrite.io/docs/functions)
-   **AI Model:** [Google Gemini API (`gemini-2.5-flash`)](https://deepmind.google/technologies/gemini/)

## ⚙️ Getting Started & Deployment

This project is configured for deployment on [Appwrite](https://appwrite.io/), either self-hosted with Docker or on Appwrite Cloud.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   [Appwrite CLI](https://appwrite.io/docs/command-line)
-   [Docker](https://www.docker.com/) (for local Appwrite instance)
-   An **Appwrite Project**
-   A new, secure **Google Gemini API Key**.

### 1. Set Up Your Appwrite Project

You can either [run Appwrite locally](https://appwrite.io/docs/self-hosting) with Docker or use [Appwrite Cloud](https://cloud.appwrite.io/). Once your Appwrite instance is running, create a new project.

### 2. Configure the Project Locally

1.  **Clone your forked repository:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    cd YOUR_REPO_NAME
    ```

2.  **Install frontend dependencies:**
    ```bash
    npm install
    ```

3.  **Log in to Appwrite CLI:**
    ```bash
    appwrite login
    ```

4.  **Link your project:**
    ```bash
    appwrite init project
    ```
    Choose to link to an existing Appwrite project and select the one you created.

### 3. Deploy the Appwrite Function

1.  **Deploy the function:**
    ```bash
    appwrite deploy function --all --yes
    ```

2.  **Add your Gemini API Key:**
    -   Navigate to your project in the Appwrite Console.
    -   Go to **Functions** and select the `generate-research` function.
    -   Go to the **Settings** tab.
    -   Scroll down to **Variables**. Add a variable with the key `API_KEY` and paste your new Google Gemini API Key as the value.

3.  **Set Function Permissions:**
    -   In the function's **Settings** tab, find the **Execute Access** section.
    -   Add the `any` role.

### 4. Configure and Run the Frontend (Locally)

1.  **Create an environment file:** Create a new file named `.env.local` in the root of the project.

2.  **Set environment variables:** In `.env.local`, add the following, replacing the values with your Appwrite project details from the **Settings** page.
    ```
    VITE_APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1"
    VITE_APPWRITE_PROJECT_ID="YOUR_PROJECT_ID"
    VITE_APPWRITE_FUNCTION_ID="generate-research"
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```

### 5. Deploying the Frontend to Appwrite Hosting

1.  In your Appwrite project console, navigate to the **Hosting** tab.
2.  Connect your GitHub account and select your repository.
3.  When prompted for the **Build Settings**, use the following:
    -   **Root Directory:** Leave this blank.
    -   **Build Command:** `npm install && npm run build`
    -   **Output Directory:** `dist`
4.  **CRITICAL STEP: Set Hosting Environment Variables**
    - After creating the hosting service, go to the **Settings** tab for your new Hosting instance.
    - Scroll down to the **Variables** section.
    - Add the three variables your frontend needs to connect to the backend, just like you did for local development. Vite will use these during the build process on Appwrite's servers.
      - `VITE_APPWRITE_ENDPOINT` = `https://cloud.appwrite.io/v1` (or your self-hosted endpoint)
      - `VITE_APPWRITE_PROJECT_ID` = `YOUR_PROJECT_ID`
      - `VITE_APPWRITE_FUNCTION_ID` = `generate-research`
5.  Save the settings and go to the **Deployments** tab to trigger a new deployment. Appwrite will now build and deploy your frontend correctly.

## 🤖 How It Works

1.  **User Input:** The user enters a research topic on the React frontend.
2.  **Appwrite SDK Call:** The React application uses the Appwrite SDK to call the `generate-research` function.
3.  **Appwrite Function Execution:** Appwrite securely executes the function, providing it with the `API_KEY` environment variable.
4.  **AI Generation:** The function sends a detailed prompt and a strict JSON schema to the `gemini-2.5-flash` model.
5.  **Structured Response:** The Gemini API returns a structured JSON object.
6.  **Display Results:** The Appwrite Function sends the JSON data back to the frontend, which then dynamically renders the results.

---

## 📄 License

This project is licensed under the MIT License.