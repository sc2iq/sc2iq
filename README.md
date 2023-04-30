# SC2IQ

## Deployment

```powershell
az login
az acr login --name sharedklgoyiacr

.\scripts\deploy.ps1 -WhatIf:$False
```
