#!/bin/bash

old_version=$(grep -Po "(?<=version=')[^']+(?=')" setup.py)
echo "Current version is $old_version. New version?(enter to use the current version)"
read new_version
if [[ -z $new_version ]]
then
    new_version=$old_version
else
    sed -i "s/version='$old_version'/version='$new_version'/g" setup.py
fi

read -p "frontend updates? (y/[n])" -r
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo -n $new_version > openaoe/frontend/version.txt
    cd openaoe/frontend
    npm install
    npm run build
    cd ../..
fi

rm -rf build/* dist/*
python setup.py sdist bdist_wheel
twine upload dist/*
