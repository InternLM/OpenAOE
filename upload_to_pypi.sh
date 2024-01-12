#!/bin/bash

old_version=$(grep -Po "(?<=version=')[^']+(?=')" setup.py)
echo "Current version is $old_version. New version?"
read new_version
sed -i "s/version='$old_version'/version='$new_version'/g" setup.py

read -p "frontend updates? (y/[n])" -r
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo -n $new_version > openaoe/frontend/version.txt
    cd openaoe/frontend
    npm install
    npm run build
fi

rm -rf build/* dist/*
python setup.py sdist bdist_wheel
twine upload dist/*
