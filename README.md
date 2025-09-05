# Auto-Research Scientist Agent

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYOUR_USERNAME%2FYOUR_REPO_NAME)
[![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Gemini-blueviolet.svg)](https://deepmind.google/technologies/gemini/)



An AI-powered agent that automates the scientific research process. It takes a research topic, finds and analyzes relevant academic papers, generates a comparative summary, and creates a baseline Jupyter notebook to kickstart experimentation.

 <img width="1294" height="792" alt="image" src="https://github.com/user-attachments/assets/3b983ae2-fe39-4f31-8b58-8bc9bbe5e087" />


---

## 🚀 Core Features

-   **Automated Research Briefs:** Generates a detailed summary of any scientific topic, explaining core concepts, importance, and recent advancements.
-   **Comparative Analysis:** Creates a side-by-side comparison table of different papers or methodologies, highlighting key findings, datasets, and techniques.
-   **Code Generation:** Automatically writes a complete, well-commented Python baseline in a Jupyter Notebook format using PyTorch or TensorFlow to start experiments immediately.
-   **Interactive UI:** A modern, responsive, and dark-mode interface with a tabbed view to easily switch between the brief, comparison table, and notebook code.
-   **One-Click Deployment:** Ready to be deployed on Vercel with minimal configuration.

## 🛠️ Tech Stack

-   **Frontend:** [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/)
-   **Backend:** [Vercel Serverless Functions](https://vercel.com/docs/functions)
-   **AI Model:** [Google Gemini API (`gemini-2.5-flash`)](https://deepmind.google/technologies/gemini/)

## ⚙️ Getting Started & Deployment

This project is optimized for deployment on Vercel.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   [Vercel Account](https://vercel.com/signup)
-   A **Google Gemini API Key**. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### 1. One-Click Vercel Deployment

This is the easiest way to get your own version of the agent running.

1.  **Fork this Repository** to your own GitHub account.
2.  **Click the "Deploy with Vercel" button** at the top of this README.
3.  **Configure the Environment Variable:**
    -   During the Vercel import process, you will be prompted to add Environment Variables.
    -   Create a new variable with the name `API_KEY`.
    -   Paste your Google Gemini API key as the value.
4.  **Deploy!** Vercel will handle the rest. Your agent will be live at the provided URL.

### 2. Local Development (Optional)

To run the application locally in an environment that mimics Vercel's production setup, you should use the Vercel CLI.

1.  **Clone your forked repository:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    cd YOUR_REPO_NAME
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Install the Vercel CLI:**
    ```bash
    npm i -g vercel
    ```

4.  **Link your project to Vercel:**
    ```bash
    vercel link
    ```

5.  **Pull environment variables:**
    ```bash
    vercel env pull .env.local
    ```
    This will create a `.env.local` file in your project with the `API_KEY` you set up in your Vercel project.

6.  **Start the development server:**
    ```bash
    vercel dev
    ```
    This command starts a local server that runs your frontend and correctly routes `/api/generate` requests to your serverless function, just like in production. Your app will be available at `http://localhost:3000`.

## 🤖 How It Works

1.  **User Input:** The user enters a research topic on the frontend.
2.  **API Request:** The React application sends a `POST` request to a secure backend serverless function located at `/api/generate`.
3.  **Serverless Execution:** The Vercel function receives the topic. It securely accesses the `API_KEY` from its environment variables to initialize the Google GenAI client.
4.  **AI Generation:** The function sends a detailed prompt and a strict JSON schema to the `gemini-2.5-flash` model.
5.  **Structured Response:** The Gemini API processes the request and returns a structured JSON object containing the research brief, comparison table data, and Python notebook code.
6.  **Display Results:** The serverless function sends the JSON data back to the frontend, which then dynamically renders the results in the interactive, tabbed UI.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
