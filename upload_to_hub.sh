#!/bin/bash

crt_version=$(grep -Po "(?<=version=')[^']+(?=')" setup.py)
echo "Current version is $crt_version. "

read -p "Frontend updates? (y/[n])" -r
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo -n $crt_version > openaoe/frontend/version.txt
    cd openaoe/frontend
    npm install
    npm run build
fi


docker build . -f docker/Dockerfile -t opensealion/open-aoe:$crt_version
docker push opensealion/open-aoe:$new_version
