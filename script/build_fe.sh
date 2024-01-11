#!/bin/bash
# frontend project build for openaoe/frontend
# this script should be RAN IN THE CURRENT PATH

function print_log() {
    echo -e "\033[32mINFO:     "$1" \033[0m"
}

function print_error() {
    echo -e "\033[31mERROR:     "$1" \033[0m"
}

function source_shell_profile() {
    if [[ $SHELL =~ 'bash' ]]; then
        source "$HOME"/.bashrc
    elif [[ $SHELL =~ 'zsh' ]]; then
        source "$HOME"/.zshrc
    fi
}

function check_nodejs() {
    print_log 'check nodejs'
    if ! node --version; then
        print_log 'no nodejs, installing nodejs with version '$NODEJS_VER' now'

        if ! (nvm install $NODEJS_VER); then
            print_error 'install nodejs failed. exit with code 1'
            exit 1
        fi
        print_log 'nodejs installed. need to restart shell terminal'
        source_shell_profile
    fi
}

function check_nvm() {
    print_log 'check nvm'
    if ! nvm --version; then
        print_log 'no nvm, installing nvm now.'
        bash nvm_install.sh
        if [ $? != 0 ]; then
            print_error 'install nvm failed. exit with code 1'
            exit 1
        fi
        print_log 'nvm installed. need to restart shell terminal'
        source_shell_profile
    fi
}

function build_frontend() {
    print_log 'building frontend project'
    if ! (cd ../openaoe/frontend/src && npm install && npm run build); then
        print_error 'build frontend project failed. exit with code 1'
        exit 1
    fi
    print_log 'frontend project built. now moving built files to dist.'


    # empty dist folder
    print_log 'emptying dist folder'
      rm -rf ../openaoe/frontend/dist


    # link built path to corresponding target path
    if ! (cd ../openaoe/frontend && ln -s ./src/dist .); then
        print_error 'built files copy failed.'
        exit 1
    fi
    print_log 'link built path to corresponding target path successfully.'
}

# global variable
NODEJS_VER='v16.20.0'

# 1. nvm
check_nvm

# 2. nodejs
check_nodejs

# 3. build frontend project
build_frontend


