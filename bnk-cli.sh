#!/bin/bash
PROJECT_DIR=$(pwd)

# run dir, get current dir and pass to setup.sh as --dir argument
sh ./node_modules/bnkit/scripts/cli.sh --dir $PROJECT_DIR