### 2025-01-16, 1 (date, is_done)
- diagnose this project to deploy in app-in-toss (ultrathink) ✓
- instead use bin files `public/gem_geometry`, using `public/gem_cads` and `scripts/prebuild-gems.mjs` , create use feature(under `src/`) ✓

#### Completed Changes:
1. Removed 416MB pre-built binary files (`public/gem_geometry/`)
2. Updated `src/utils/gemcadLoader.ts` to use runtime .asc parsing only
3. Kept 8.8MB source files (`public/gem_cads/`) for on-demand geometry generation
4. Removed `prebuild-gems` script from package.json
