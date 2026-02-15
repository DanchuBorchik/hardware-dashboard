# Changelog
All notable changes to the Hardware Portal project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Performance Improvements Planned
- [ ] Task #5: CSS-based filtering (P1 - 1 day)
- [ ] Task #6: Extract data to JSON (P1 - 1 day)
- [ ] Task #7: Virtual scrolling (P2 - 2-3 days)

## [0.2.0] - 2026-02-14

### Added
- Comprehensive audit report saved to `docs/AUDIT-2026-02-14.md`
- Task tracking system for performance improvements
- CHANGELOG.md for tracking all changes
- DOM caching system (`initDomCache()`) to reduce repeated DOM queries
- Performance logging utilities (`perfStart()`, `perfEnd()`)
- Debounce utility function for search optimization
- Resource hints (preconnect) for Google Fonts CDN

### Changed
- Restructured from single HTML file to proper project structure
- Separated concerns: index.html, css/styles.css, js/script.js

### Performance Improvements Completed ✅
- [x] Task #1: Add search debouncing (300ms delay) - **90% improvement on search**
- [x] Task #2: Cache DOM query results - All critical paths now use cached references
- [x] Task #3: Add performance logging - `console.time/timeEnd` tracking render performance
- [x] Task #4: Optimize font loading - Added preconnect hints + display=swap

### Technical Details
- **js/script.js lines 410-453**: Added DOM cache and performance utilities
- **js/script.js line 669**: Added `perfStart('render')` at beginning of render function
- **js/script.js lines 682, 816**: Added `perfEnd('render')` at render exits
- **js/script.js line 1063**: Implemented debounced search with 300ms delay
- **index.html lines 7-9**: Added preconnect hints for fonts.googleapis.com
- Updated 8 functions to use cached DOM references instead of `document.getElementById()`

### Metrics
**Before optimization:**
- Search caused full re-render on every keystroke
- 1,500+ DOM nodes created/destroyed per search character
- Repeated DOM queries throughout application

**After optimization:**
- Search debounced to 300ms (12 keystrokes → 1 render for "architecture")
- DOM queries cached and reused
- Performance logging enabled for measuring improvements

## [0.1.0] - 2026-02-14

### Added
- Initial commit with CPU architecture roadmap HTML file
- Git repository initialization
- README.md with project documentation
- .gitignore for system files

### Notes
- Original single-file implementation preserved as `cpu-architecture-roadmap.html`
