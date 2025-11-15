# SC2IQ

## Deployment

### Preparation

```bash
az login
# Matt Mazzola - Personal
az account set -n 375b0f6d-8ad5-412d-9e11-15d36d14dc63
az account show --query "name" -o tsv
az acr login --name sharedklgoyiacr
```

## Deployment

### What If Deployment

```sh
azd provision --preview

./pipelines/scripts/what-if.sh
```

### Deployment

```sh
azd up
```

