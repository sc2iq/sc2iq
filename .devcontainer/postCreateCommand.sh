#! /bin/bash

set -ex

echo "Print OS and Tool Versions"

# OS
lsb_release -a

# Tools
git --version
docker --version
az version
azd version
jq --version
npm --version
node --version

echo "INSTALLING PROJECT DEPENDENCIES"

# TODO: Add any project specific dependency installation commands here

echo "postCreateCommand.sh finished!"

