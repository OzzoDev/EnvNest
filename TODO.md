# 🛠️ TODO: EnvVault Project

---

## 📦 Setup & Config

- [x] Create Next.js App with Tailwind + TS + App Router
- [x] Install `next-auth`, `pg`
- [x] Setup GitHub OAuth App & `NEXTAUTH` config
- [x] Create `.env.local` file with secrets
- [ ] Create reusable DB client (`pg`)

---

## 🔐 Auth Flow

- [x] GitHub login with `next-auth`
- [ ] Store GitHub user in `users` table (if new)
- [ ] Save GitHub access token for repo/org access

---

## 🧩 Core Models (DB Schema)

- [ ] Create `users` table
- [ ] Create `organizations` + `organization_members`
- [ ] Create `projects` + `project_members`
- [ ] Create `env_files` table (with encrypted content)
- [ ] Create `env_history` table (with commit message)

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
