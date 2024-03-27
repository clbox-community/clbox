#!/bin/bash

npx ts-node -r tsconfig-paths/register -P libs/skill-roadmap/tsconfig.lib.json libs/skill-roadmap/src/lib/skill-roadmap-validate.cli.ts
