---

# 🚀 EdTech Deployment Guide (VPS ONLY ⚠️)

> ⚠️ Do NOT run this on your local Linux machine.
> This setup is ONLY for VPS deployment with GitHub Actions Runner.

---

# 🧑‍💻 1. Create deployment user

```bash id="u1"
adduser deploy
```

---

# 🔐 2. Give Docker permission

```bash id="u2"
usermod -aG docker deploy
#for allow sudo
usermod -aG sudo deploy
```

---

# 👤 3. Switch to deploy user

```bash id="u3"
su - deploy
```

---

# 📁 4. Create project structure

```bash id="u4"
mkdir -p ~/app/app
mkdir -p ~/app/scripts
```

---

# 📦 5. Clone repository

```bash id="u5"
cd ~/app/
git clone <YOUR_REPO_URL> .
mv EdTech/ app
cd app
git checkout staging
```

---

# 🚀 6. Setup deploy script

```bash id="u6"
cp deploy.sh ~/app/scripts/deploy.sh
chmod +x ~/app/scripts/deploy.sh
```

---

# ⚙️ 7. GitHub Actions Workflow

📍 File location inside repo:

```text id="u7"
.github/workflows/deploy-staging.yml
```

---

## 📄 Workflow file

```yaml id="u8"
name: Deploy to Staging

on:
  push:
    branches:
      - staging

jobs:
  deploy:
    runs-on: self-hosted

    steps:
      - name: Show runner info
        run: |
          whoami
          pwd
          echo "Deploying staging..."

      - name: Run deploy script
        run: /home/deploy/app/scripts/deploy.sh
```

---

# 🧾 8. View VPS logs (GitHub Runner)

```bash id="u9"
journalctl -u actions.runner* -f
```

---

# 🤖 9. Install GitHub Runner as a service (IMPORTANT)

```bash id="u10"
cd ~/actions-runner
sudo ./svc.sh install
sudo ./svc.sh start
```

---

# 🔥 10. How deployment works

```text id="u11"
git push staging
        ↓
GitHub detects push
        ↓
Triggers workflow
        ↓
Sends job to VPS runner
        ↓
Runner executes deploy.sh
        ↓
Git reset + Docker rebuild
        ↓
App updated on VPS
```

---

# ⚠️ Important rules

* ❌ DO NOT run this on your local machine
* ❌ DO NOT use `git clean -fd` (can delete `.env`)
* ❌ DO NOT store secrets in Git
* ✅ Use `svc.sh` for stable background runner
* ✅ Use staging branch for safe deploys

---

# 🧠 Summary

You now have:

✔ VPS-based deployment system
✔ GitHub Actions CI/CD pipeline
✔ Self-hosted runner
✔ Docker auto deploy on push

---

