# EnvNest - CLI 🌱🔐

EnvNest is a secure, GitHub-integrated `.env` file manager for developers and teams.  
It helps you manage, encrypt, version, and sync environment configuration files across projects — with GitHub login, PostgreSQL backend, and custom encryption.

## Features
- 🔐 Secure storage of environment variables
- 🔄 Sync secrets between local and remote projects
- 🔑 GitHub authentication
- 🗄️ PostgreSQL backend with encryption
- ⚡ Simple CLI for fast secret management

## Installation

```bash
npm install envnest
````

## Commands

| Command          | Description                                                                       |
| ---------------- | --------------------------------------------------------------------------------- |
| `envnest`        | Login and start securely syncing your secrets locally.                            |
| `envnest up`     | Sync your local project changes and environment variables with the remote server. |
| `envnest logout` | Logout from EnvNest CLI and clear local authentication.                           |

## Usage

```bash
# Install CLI
npm install envnest

# Login
envnest

# Sync your .env secrets
envnest up

# Logout
envnest logout
```

---

## License

MIT
