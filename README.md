# SC2IQ

## Deployment

### Preparation

```bash
az login
az account set -n "Matt Mazzola - Personal Projects Recovered"
az account show --query "name" -o tsv
az acr login --name sharedklgoyiacr
```

### What If Deployment

```pwsh
.\scripts\deploy.ps1
```

### Deploy

```powershell
.\scripts\deploy.ps1 -WhatIf:$False
```
