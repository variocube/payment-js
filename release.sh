#!/usr/bin/env bash

die() {
	echo >&2 "$@"
	exit 1
}

# Allow to make release only from main
[[ $(git rev-parse --abbrev-ref HEAD) == "main" ]] || die "Error: Release can only be made from main branch."

# Make sure we are up to date
echo -n "git pull... "
git pull

# Make sure there no local changes
[[ $(git status --porcelain) ]] && die "Error: Local changes detected."

# Read version from Gradle
#java_version=$(java/gradlew -b java/build.gradle properties --no-daemon --console=plain -q | grep "^version:" | awk '{printf $2}')
js_version=$(jq .version -r < package.json)

#[[ "$java_version" == "$js_version" ]] || die "Error: Version mismatch between java and javascript library."

# Create and push version tag
git tag "$js_version"

git push origin master
git push --tags

