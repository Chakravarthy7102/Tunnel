#!/bin/bash

# Don't create a preview deployment if the branch is "main"
if [ "$VERCEL_GIT_COMMIT_REF" == "main" ];
then
	exit 0
fi

# Always create a new (staging) deployment if the branch is "release"
if [ "$VERCEL_GIT_COMMIT_REF" == "release" ];
then
	exit 1
fi

# Do not deploy if the commit message contains "[skip ci]"
if git log -1 --pretty=oneline --abbrev-commit | grep -w "\[skip ci\]"; then
	exit 0
fi

exit 1
