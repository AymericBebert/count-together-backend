#!/usr/bin/env sh

set -eu

echo "Object.defineProperty(exports, '__esModule', { value: true });" >/count-together/dist/config.js
echo "exports.config = {" >>/count-together/dist/config.js
echo "    version: '$(cat /version.txt)'," >>/count-together/dist/config.js

env | while IFS= read -r line; do
  name=${line%%=*}
  value=${line#*=}
  case $name in CFG_*)
    echo "  \"$(echo "$name" | cut -c5-)\": $value," >>/count-together/dist/config.js
    ;;
  esac
done

echo "};" >>/count-together/dist/config.js

exec "$@"
