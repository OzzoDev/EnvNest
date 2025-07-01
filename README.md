# EnvNest 🌱🔐

EnvNest is a secure, GitHub-integrated `.env` file manager for developers and teams. It helps manage, encrypt, version, and sync environment configuration files across teams and projects — with GitHub login, PostgreSQL backend, and custom encryption.

---

## ✨ Features

- 🔐 **GitHub OAuth Login** (NextAuth)
- 🧠 **Organization & Team Structure**
- 📁 **Multiple Projects Per Team**
- 📄 **Manage Multiple `.env` Files** per project (supports subfolders)
- 🔏 **End-to-End Encryption** of `.env` content
- 📝 **Custom `.env` Editor** with syntax validation
- 📚 **Version History** for all changes with commit-like messages
- 🧪 **NPM CLI Tool** to fetch and inject `.env` files locally via GitHub login

---

## 🧩 Why This Solves Real Developer Pain

Collaborating on `.env` files is frustrating and error-prone:
- Developers often send `.env` files over insecure channels (Slack, email, zip)
- There's no version history for environment variables
- Sharing sensitive credentials is risky
- Updating `.env` files across teams is manual

**EnvVault** solves these issues by offering:
- GitHub-first team auth & project mapping
- Fully encrypted `.env` storage with audit trails
- Easy project collaboration via orgs
- A CLI tool to instantly inject `.env` files into your local project

---

## 🔧 Tech Stack

- **Next.js (App Router, TypeScript, Tailwind)**
- **NextAuth.js** (GitHub OAuth)
- **PostgreSQL** (raw SQL via `pg`)
- **ShadCN/UI** (Beautiful, accessible UI)
- **Encryption**: AES-GCM or libsodium (TBD)
- **NPM CLI Tool**: Node.js + GitHub device flow auth

---

## 🚧 Project Status

Currently in MVP development phase.

- [x] Project scaffolding (Next.js + Tailwind + TypeScript)
- [x] GitHub OAuth login via NextAuth
- [x] User table sync (PostgreSQL)
- [x] Project/org structure
- [x] Encrypted `.env` file CRUD
- [x] Versioning & rollback
- [x] Custom editor
- [x] CLI tool

---

## 📜 License

MIT — Open to contributors and collaborators.
