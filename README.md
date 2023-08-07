# SC2IQ

## Deployment

### Preparation

```powershell
az login
az acr login --name sharedklgoyiacr

.\scripts\deploy.ps1
```

### Deploy

```powershell
.\scripts\deploy.ps1 -WhatIf:$False
```
