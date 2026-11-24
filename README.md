# MS Exam Study Tracker

A Microsoft Fabric App that turns any Microsoft Learn exam study guide into a visual study tracker.

Pick an exam (DP-600, DP-700, DP-800, PL-300, or any other Microsoft exam with a study guide), see how the exam is weighted, and mark each skill as you study. The app shows how ready you are, weighted the same way the exam is.

Built by [Shabnam Watson](https://www.linkedin.com/in/shabnamwatson/) with [Microsoft Fabric Apps](https://learn.microsoft.com/en-us/fabric/apps/overview) (preview).

## What it does

- **Exam map.** Each domain is a tile sized by its exam weight, so you can see at a glance where the points are.
- **Track every skill.** Mark each skill as *Not started*, *Studying*, *Reviewed* or *Confident*. Filter the list by status.
- **Readiness score.** A progress ring shows how ready you are, weighted by domain the same way the exam is.
- **Small rewards.** Celebrations when you master a section, a domain or a readiness milestone, plus an optional "study break" panel with clean data and office jokes.
- **Start over.** Reset all your progress, with an "Are you sure?" check first.
- **Private progress.** You sign in with your Fabric account, and each person only sees their own progress.

## How it works

```text
Microsoft Learn study guides
        │  (web pages)
        ▼
Fabric notebook: SyncExamStudyGuides      run it when you like, or schedule it daily
        │  writes two Delta tables
        ▼
Lakehouse: ExamCatalog                    exams, exam_skills
        │  read-only connector (SQL analytics endpoint)
        ▼
Fabric App: MS Exam Study Tracker  ◀──▶  App database: your progress (MyExam, SkillProgress)
```

> [!IMPORTANT]
> **The official study guide comes first.** The Microsoft Learn study guide is the official source for every exam, so always check it before your exam. This app reads those pages automatically, so it may contain errors, or stop updating if Microsoft changes how the study guide pages are laid out.

## What you need

- A **Microsoft Fabric workspace** on a capacity where **Fabric Apps (preview)** is available, and permission to create items in it.
- **Node.js 22.13 or later** and **Git** on your computer.
- About 20 minutes.

## Set it up in your own Fabric workspace

### 1. Create a workspace

In Fabric, create a workspace for the app, for example **Exam Study Tracker**. Remember the name; you'll use it when you deploy.

### 2. Create the lakehouse

In that workspace, select **New item → Lakehouse** and name it **ExamCatalog**.

### 3. Load the exam skills with the notebook

1. In the workspace, select **Import → Notebook → From this computer**, and pick [`notebooks/SyncExamStudyGuides.ipynb`](notebooks/SyncExamStudyGuides.ipynb) from this repo.
2. Open the notebook. In the **Explorer** pane, add the **ExamCatalog** lakehouse and make it the default lakehouse.
3. Optional: in the last cell, edit the `EXAMS` list to the exams you want, for example `EXAMS = ["DP-600", "DP-700", "DP-800", "PL-300"]`.
4. Select **Run all**. When it finishes, the lakehouse has two tables: `exams` and `exam_skills`.
5. Optional: schedule the notebook to run daily (**Run → Schedule**) so the skills stay in step with any changes to the study guides.

### 4. Get the code

```bash
git clone https://github.com/ShbWatson/ms-exam-study-tracker.git
cd ms-exam-study-tracker
npm install
```

If `npm install` stops with a peer dependency (`ERESOLVE`) error, run `npm install --legacy-peer-deps` instead.

### 5. Connect the app to your lakehouse

The app reads the exam list through a read-only connector. Its settings live in [`rayfin/rayfin.yml`](rayfin/rayfin.yml), which points at two values you keep in `rayfin/.env`. That file is ignored by git, so your IDs never end up on GitHub.

1. In Fabric, open your **ExamCatalog** lakehouse. The address bar looks like this:

   ```text
   https://app.fabric.microsoft.com/groups/<workspace ID>/lakehouses/<lakehouse ID>?...
   ```

2. Create a file named `.env` in the `rayfin` folder (there's a sample in [`rayfin/env.example`](rayfin/env.example)) and add your two IDs:

   ```ini
   CATALOG_WORKSPACE_ID=<workspace ID>
   CATALOG_LAKEHOUSE_ID=<lakehouse ID>
   ```

The Rayfin CLI also writes its own settings to `rayfin/.env` when you deploy. It keeps your two lines.

### 6. Deploy to Fabric

```bash
npx rayfin up --item-name "MS Exam Study Tracker" --workspace "Exam Study Tracker"
```

Use your own workspace name if it's different. The first run asks you to sign in to Fabric, then creates the app in your workspace and gives you its address. Run the same command again to deploy later changes.

### 7. Try it locally (optional)

```bash
npm run dev
```

Then open http://localhost:5173. If port 5173 is busy, stop whatever is using it first; the app's sign-in only allows that port.

## Add another exam

Add the exam code to the `EXAMS` list in the notebook and run it again. For example, `"AZ-104"` or `"AI-102"`. Any Microsoft exam with a study guide at `learn.microsoft.com/credentials/certifications/resources/study-guides/<exam code>` should work. There's no app change and no redeploy: refresh the app and the new exam appears.

If a new exam doesn't show up right away, open the lakehouse's **SQL analytics endpoint** in Fabric and select **Refresh**, then refresh the app.

## Make it yours

The About page (the **About** link in the header) is about me, the person who built this. To change it, edit [`packages/frontend/src/study/about-content.ts`](packages/frontend/src/study/about-content.ts). All the wording, links and the photo are in that one file. Leave a link's `href` empty to hide that button.

## Project layout

```text
.
├── notebooks/
│   └── SyncExamStudyGuides.ipynb       # Reads the study guides into the ExamCatalog lakehouse
├── rayfin/
│   ├── rayfin.yml                      # App services and the read-only "catalog" connector
│   ├── env.example                     # Sample for rayfin/.env (your IDs go there)
│   └── connectors/catalog/             # Exams and ExamSkills entities (lakehouse tables)
├── packages/
│   ├── data/                           # App database: MyExam, SkillProgress (owner-only)
│   ├── shared/                         # Types shared by the data package and the frontend
│   └── frontend/                       # React + Vite + Tailwind app
│       └── src/study/                  # The study tracker screens
└── scripts/                            # Fabric Apps template tooling
```

## Useful commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Runs the app locally at http://localhost:5173 |
| `npm test` | Runs the tests |
| `npm run lint` | Checks the code style |
| `npm run typecheck` | Checks the TypeScript types |
| `npx rayfin up --item-name "…" --workspace "…"` | Builds and deploys the app to Fabric |

## Troubleshooting

- **`Environment variable 'CATALOG_WORKSPACE_ID' referenced in rayfin.yml … is not defined`**: create `rayfin/.env` with your two IDs (step 5).
- **The app opens but shows no exams**: run the notebook (step 3), then refresh the lakehouse's SQL analytics endpoint in Fabric.
- **Percentages look garbled (`10â€“15%`)**: you're using an old copy of the notebook. Use the one in this repo, which reads the pages as UTF-8.
- **The notebook fails on an exam**: Microsoft may have changed that study guide page. The other exams still sync. Check the official study guide, and open an issue here.

## Built with

- [Microsoft Fabric Apps](https://learn.microsoft.com/en-us/fabric/apps/overview) (preview) and the Rayfin CLI and SDK
- A Fabric notebook and lakehouse for the exam catalog
- React, Vite, Tailwind CSS, Framer Motion and Lucide icons

## License

[MIT](LICENSE). This project started from the Microsoft Fabric Apps universal-app template, which is also MIT licensed.
