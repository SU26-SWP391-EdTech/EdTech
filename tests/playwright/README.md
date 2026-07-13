# Playwright Test Setup

## Installation

Run the installation script:

```powershell
.\install.ps1
```

This will install the required dependencies for Playwright and the visible mouse extension.

For more information about the visible mouse framework, see:
https://github.com/tuserl/playwright-visible-mouse/tree/main/docs

## Environment Setup

Navigate to the test folder:

```powershell
cd tests\playwright\edTechTestFiles
```

Copy the example environment file:

```powershell
cp .env.example .env
```

or on Windows Command Prompt:

```cmd
copy .env.example .env
```

Update the `.env` file with your testing credentials.

## Available Test Scripts

### Login by Email

```powershell
.\runlogin-email.ps1
```

### Role-based Login

```powershell
.\runlogin-role.ps1
```

### Login Validation Tests

```powershell
.\runlogin-validation.ps1
```

