# DAVYLAB × Astryx isolated pilot

This is a **development experiment**, not a deployed production integration. Main DesignOS remains unchanged.

## Run
```sh
cd experiments/astryx-pilot
npm install
npm run test
npm run build
npm run dev
```

The Astryx core version is pinned to the verified upstream source (0.7.12). Other packages are intentionally not considered reproducibly pinned until a successful dependency install generates and commits package-lock.json. Verify package compatibility before promotion.

## Acceptance gates
1. Resolve npm dependencies and commit lockfile.
2. Run tests and production build.
3. Browser-check Astryx Button click, input filtering, keyboard navigation, 375/390/430px widths, no horizontal overflow.
4. Inspect brand tokens and light/dark compatibility; currently only the light token prototype is present.
5. Add navigation, forms, dialogs, tables only after checking exact Astryx API signatures.
6. No production deploy until these checks pass.

## Rollback
Delete this experiment directory / branch. No root scripts or production entrypoints are modified.
