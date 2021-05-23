#!/usr/bin/env bash

BUILD_CONFIGURATION=$1

if [ -z $BUILD_CONFIGURATION ]; then
  read -p "Enter build configuration [PRODUCTION/testing]: " bc
  BUILD_CONFIGURATION=${bc:-production}
fi

tags=$(git describe --contains)

if [ -z $tags ]; then
  echo "No tag on current commit. Latest tags:"
  git tag | sort -V | tail -n 3

  read -p "Enter new tag: " newtag

  [ -z "$newtag" ] && echo "No version specified" && exit 1

  if ! git tag $newtag; then
    read -p "Git tag failed, continue? [y/N]: " c
    if [[ ! $c =~ ^[Yy]$ ]]; then
      echo "Cancelled"
      exit 2
    fi
  fi
else
  if [[ $tags == *" "* ]]; then
    echo "Ambiguous tag. Aborting."
    exit 1
  else
    echo "Using git tag"
    newtag=$tags
  fi
fi

function delete_new_tag() {
  if [ -z $tags ]; then
    echo "Removing new git tag $newtag"
    git tag -d $newtag >/dev/null
  fi
}

version=$newtag
if [ "$BUILD_CONFIGURATION" != "production" ]; then
  version=$newtag-$BUILD_CONFIGURATION
fi

read -p "Will build version $version, configuration $BUILD_CONFIGURATION, continue? [y/N]: " c
if [[ ! $c =~ ^[Yy]$ ]]; then
  echo "Cancelled"
    delete_new_tag
  exit 2
fi

echo "-----"
echo "Building count-together-backend:$version..."
docker build -t aymericbernard/count-together-backend:$version --build-arg BUILD_CONFIGURATION=$BUILD_CONFIGURATION --build-arg VERSION=$version . ||
  {
    echo 'Build failed'
    delete_new_tag
    exit 1
  }

echo "Pushing count-together-backend:$version to docker registry..."
docker push aymericbernard/count-together-backend:$version ||
  {
    echo 'Push failed'
    exit 1
  }

echo "Pushing git tag..."
git push origin $version
