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
- [] Env file editor (textarea)

---

## 🖥️ UI Pages (ShadCN + App Router)

- [ ] Dashboard after login
- [ ] Project list view
- [ ] Create project from GitHub repo
- [ ] Env file editor (custom component)
- [ ] Env file version history viewer
- [ ] Team management (invite/search GitHub users)

---

## 🔐 Encryption Helpers

- [ ] Create `encryptContent(content, key)`
- [ ] Create `decryptContent(encrypted, key)`
- [ ] Strategy for key sharing among project members

---

## 🧪 NPM CLI Tool (Final Phase)

- [ ] GitHub login flow (device code flow)
- [ ] Fetch encrypted file from API
- [ ] Decrypt locally
- [ ] Write to `.env` in local project folder

---

## 🧹 Extras

- [ ] Validate `.env` key=value pairs in custom editor
- [ ] Show diff between env versions
- [ ] Add unit + integration tests
- [ ] Polish UI and add loading states
