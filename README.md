# 🎓 Welcome to Attendy! (Intern Onboarding Guide)

Welcome to the **Attendy** engineering team! Attendy is a modern college attendance tracking web and mobile app designed for students to track their lectures, view attendance calendars, and maintain overall target percentages.

This guide was built specifically for you so you can feel completely comfortable exploring, understanding, and working on this codebase on your very first day!

---

## ⚡ Top 3 Terminal Commands to Get Started

Open your terminal or command prompt inside the project folder and run these top 3 commands:

1. **Install All Tools & Packages**:
   ```bash
   npm install
   ```
   *Analogy*: This downloads all the software instruments and libraries from the cloud so your computer has everything required to build the app.

2. **Start Your Local Development Server**:
   ```bash
   npm run dev
   ```
   *Analogy*: This turns on your local test web server. Open your web browser and go to `http://localhost:3000` to see the live app running on your machine!

3. **Check for Code Errors (Type Check)**:
   ```bash
   npx tsc --noEmit
   ```
   *Analogy*: Think of this like a spell-checker for your code. It scans your code for any typos or mistakes without changing any files.

---

## 🗺️ Beginner's Map of the Project

Here is a clear map of every major folder and configuration file in the project, explained using simple everyday analogies:

| Folder / File | What it is (Everyday Analogy) |
| :--- | :--- |
| **`src/`** | **The Code Cabinet**: The main single container that holds all human-written code and logic for the application. |
| **`src/app/`** | **The Blueprint Room**: The layout planner where all web page screens (like Login and Dashboard) and API communication routes are defined. |
| **`src/components/`** | **The Box of Lego Bricks**: Reusable visual blocks (like buttons, progress bars, cards, and modal popups) assembled together to build pages. |
| **`src/hooks/`** | **The Smart Helpers**: Reusable utility functions that help components remember info, track screen sizes, or display pop-up toasts. |
| **`src/lib/`** | **The Engine Room**: Behind-the-scenes logic that manages database connections (`db.ts`), state management (`attendance-store.ts`), and helper calculations. |
| **`src/styles/`** | **The Paint & Theme Bucket**: The color guidelines, theme tokens, and CSS design rules that make the app look visual and sleek. |
| **`mobile/`** | **The Smartphone Box**: Isolated native mobile project files (`android/`, `ios/`, `capacitor.config.ts`) used when building the Android or iOS phone apps. |
| **`database/`** | **The Database Filing Cabinet**: A quiet storage cabinet where local database files (`attendy.db`) live out of sight. |
| **`docker/`** | **The Shipping Container Instructions**: Deployment configurations (`Dockerfile`) used to package the app into a container for cloud servers. |
| **`public/`** | **The Store Display Window**: Publicly accessible static assets like app logo images, icons, and web manifest files. |
| **`package.json`** | **The Tool Shopping List**: A list of all external software packages and terminal command shortcuts the app needs to run. |
| **`tsconfig.json`** | **The Code Rulebook**: The instruction manual for TypeScript that sets strict rules to keep the code clean and prevent bugs. |
| **`components.json`** | **The Design System Map**: Configuration file telling UI tools where components and global styles are located. |
| **`next.config.mjs`** | **The App Engine Settings**: Core configuration settings for the Next.js web application framework. |
| **`.env.local`** | **The Secret Vault**: A private file holding secret passwords, database connection links, and API keys that are never shared publicly. |

---

## ⚠️ Day 1 Warning Check & Troubleshooting

Before you write your first line of code, review these 3 important tips so you don't run into confusing errors:

1. 🔑 **Database Connection (`DATABASE_URL`)**:
   - The app connects to a PostgreSQL cloud database using `DATABASE_URL` inside `src/lib/db.ts`.
   - Make sure you have a `.env.local` file at the root containing your `DATABASE_URL` string. If `DATABASE_URL` is missing, the app will display a friendly error informing you to add it.

2. 📍 **Import Path Aliases (`@/`)**:
   - All internal imports use the `@/` prefix (e.g. `import { getDb } from "@/lib/db"`).
   - The `@/` alias is configured in `tsconfig.json` to look inside `src/`. If you create a new file, place it inside `src/` so `@/` finds it easily!

3. 📱 **Mobile App Building**:
   - Web development happens inside `src/`.
   - If you need to build or sync the Android mobile app, run `npm run cap:sync` or `npm run cap:build`. The native mobile files are neatly tucked inside `mobile/`.

---

🎉 **You are all set! Happy Coding!** If you ever get stuck, ask your team lead or run `npx tsc --noEmit` to inspect any code messages.
