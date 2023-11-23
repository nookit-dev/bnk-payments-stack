#!/bin/bash
PROJECT_DIR=$(pwd)

# run dir, get current dir and pass to setup.sh as --dir argument
sh ./node_modules/bnkit/utils/setup-scripts/fly-deploy-files/setup.sh --dir $PROJECT_DIR