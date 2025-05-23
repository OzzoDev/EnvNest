# VAULT: Secure Secrets Storage Guide

This document outlines the design and security principles behind managing `.env` files securely within the EnvVault platform.

---

## 🔐 Encryption Architecture Overview

We encrypt `.env` file content at rest using **project-level symmetric keys**, which are themselves encrypted using a **root key** that is not stored in the database.

---

## ✅ Steps to Follow

### 1. Generate a Unique Key Per Project

- Every project must generate a unique 256-bit AES key (called the "project key").
- This key is used to encrypt and decrypt all `.env` secrets associated with the project.

### 2. Encrypt the Project Key with the Root Key

- The project key is **never stored in plaintext**.
- It must be encrypted using a server-side `ROOT_ENCRYPTION_KEY` (stored as an environment variable).
- The encrypted form of the project key is stored in the `project_key.encrypted_key` column.

> ❗️ **NEVER store `project_key.encrypted_key` unencrypted.**

---

## 💾 Secret File Encryption

- `.env` files are stored as encrypted blobs in the `secret.content` column.
- Use the decrypted project key to encrypt and decrypt these blobs.
- Optionally version these secrets for rollback purposes.

---

## 🔁 Key Rotation

- To rotate a project key:
  1. Decrypt all secrets using the old project key.
  2. Generate a new key.
  3. Encrypt secrets with the new key.
  4. Re-encrypt and replace `project_key.encrypted_key`.

> 🔁 **Rotate `project_key` by re-encrypting all secrets with a new key.**

---

## ✅ Recommended Cryptography

- Use `AES-256-GCM` for authenticated encryption.
- Use **libsodium** or Node’s native **`crypto.subtle` (Web Crypto API)** for modern and secure cryptography.

> 🛡️ **Use AES-256-GCM with libsodium or Web Crypto API for security.**

---
