# 🛠️ TODO: EnvVault Project

---

## 📦 Setup & Config

- [x] Create Next.js App with Tailwind + TS + App Router
- [x] Install `next-auth`, `pg`
- [x] Setup GitHub OAuth App & `NEXTAUTH` config
- [x] Create `.env.local` file with secrets
- [x] Create reusable DB client (`pg`)

---

## 🔐 Auth Flow

- [x] GitHub login with `next-auth`
- [x] Store GitHub user in `users` table (if new)
- [x] Save GitHub access token for repo/org access

---

## 🧩 Core Models (DB Schema)

- [x] Create `users` table
- [x] Create `organizations` + `organization_members`
- [x] Create `projects` + `project_members`
- [x] Create `env_files` table (with encrypted content)
- [x] Create `env_history` table (with commit message)

---

## DB-integration and repo access

- [x] Get user's repos also those in organizations
- [x] Created the db client and add types (as of now there is only profile model)
- [x] Install and set up trpc client for frontend/backend communication

---

## Dashboard

- [x] Create new project form
- [x] Project list
- [x] Dashboard top (project overview eg.), include button to delete project
- [x] Environment selector (env file for dev/prod)
- [x] Store content in zustand store and save to db on user actions
- [x] Make env file editor as a list of inputs wit key/value pair (value input must be like password toggle)
- [x] Prompt user to enter a change message when the env needs to be saved and save these message to audit log
- [x] Audit log model to handle creating and getting logs
- [x] Render the Audit log
- [x] Handle rollback to previous versions
- [x] Filter available paths to avoid duplicate paths in same enviornment
- [x] Select component to select a given secret
- [x] Create a new secret_history table to use to track user activity and allow for easy switching between latest (5) secrets
- [x] Sidebar to be able to hide/show project form, project list and history logs
- [x] Loading and error states
- [x] Make moblie responsive

---

## Templates page

- [x] Page to allow user to create templates which can later be used for creating new .env files

---

## Collaborator page

- [x] Organization form
- [x] Invite collaborator to project
- [x] Handle the owner's accesstoken in the db to allow all projects member can fetch from github with this access
- [x] Private repos wont be accessible to others, hence we need to ensure organization's cant be created on a private repo

---

## Caching

- [] Use redis to handle chaching on the server when fetching from the github api

---

## Login page

- [] Create Login form

---

## Landing page

- [] Hero section
- [] CTA (eg. get started today)
- [] Perks and business overview

---

## CLI tool

- [] CLI tool to install .env file locally
- [] Handle github login in terminal

## Final touches

- [] Write unit tests
- [] Test flow
- [] Make prod ready
- [] Deploy
