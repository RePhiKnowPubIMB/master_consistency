# Hosting Guide: Consistency Architect

This guide will help you deploy your **Consistency Architect** application for free using:
1.  **MongoDB Atlas** (Database)
2.  **Render** (Backend API)
3.  **GitHub Pages** (Frontend)

---

## Phase 1: Database Setup (MongoDB Atlas)

1.  Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and sign up.
2.  Create a new **Cluster** (select the **Free** tier, usually M0).
3.  **Create a User:**
    *   Go to "Database Access" -> "Add New Database User".
    *   Username: `admin` (or your choice).
    *   Password: **StrongPassword123** (Save this!).
    *   Role: "Read and write to any database".
4.  **Allow Network Access:**
    *   Go to "Network Access" -> "Add IP Address".
    *   Select **"Allow Access from Anywhere"** (`0.0.0.0/0`).
    *   Click Confirm.
5.  **Get Connection String:**
    *   Go to "Database" -> "Connect" -> "Drivers".
    *   Copy the connection string. It looks like:
        `mongodb+srv://admin:<password>@cluster0.xyz.mongodb.net/?retryWrites=true&w=majority`
    *   Replace `<password>` with your actual password.
    *   **Save this string**, you will need it for Render.

---

## Phase 2: Backend Deployment (Render)

1.  Push your code to **GitHub**. Ensure your project structure is correct (root folder contains `server` folder).
2.  Go to [Render](https://render.com/) and sign up/login.
3.  Click **"New +"** -> **"Web Service"**.
4.  Connect your GitHub repository.
5.  **Configure the Service:**
    *   **Name:** `consistency-architect-api`
    *   **Region:** Closest to you (e.g., Singapore, Frankfurt).
    *   **Branch:** `main` (or master).
    *   **Root Directory:** `server` (Important! This tells Render where your backend code is).
    *   **Runtime:** `Node`
    *   **Build Command:** `npm install`
    *   **Start Command:** `npm start`
6.  **Environment Variables:**
    *   Scroll down to "Environment Variables".
    *   Add `MONGO_URI`: Paste your MongoDB connection string from Phase 1.
    *   Add `PORT`: `5000` (Optional, Render sets its own, but good to have).
7.  Click **"Create Web Service"**.
8.  Wait for the deployment to finish. You will get a URL like `https://consistency-architect-api.onrender.com`.
    *   **Copy this URL.**

---

## Phase 3: Frontend Deployment (GitHub Pages)

1.  Open your project in VS Code.
2.  Open `server/client/vite.config.js`.
    *   Add `base: '/<your-repo-name>/',` to the config.
    *   Example: If your repo is `my-todo-app`, it should look like:
        ```javascript
        export default defineConfig({
          plugins: [react()],
          base: '/my-todo-app/', 
        })
        ```
3.  Open `server/client/.env` (create it if it doesn't exist).
    *   Add: `VITE_API_URL=https://consistency-architect-api.onrender.com/api`
    *   (Replace with your actual Render URL from Phase 2).
4.  Open `server/client/package.json`.
    *   Add `"homepage": "https://<your-github-username>.github.io/<your-repo-name>",` at the top level.
    *   Add a deploy script to `scripts`:
        ```json
        "predeploy": "npm run build",
        "deploy": "gh-pages -d dist"
        ```
5.  Install `gh-pages`:
    *   Run: `cd server/client && npm install gh-pages --save-dev`
6.  **Deploy:**
    *   Run: `npm run deploy`
7.  Go to your GitHub Repository Settings -> **Pages**.
    *   Ensure the source is set to `gh-pages` branch.
8.  Visit your site!

---

## Troubleshooting

*   **CORS Errors:** If the frontend can't talk to the backend, go to `server/server.js` and update the CORS configuration:
    ```javascript
    app.use(cors({
        origin: 'https://<your-github-username>.github.io'
    }));
    ```
    Then redeploy the backend.
*   **White Screen on Frontend:** Check the Console (F12). If it says "Failed to load resource", check your `base` path in `vite.config.js`.
