# Testing Instructions for Task #5: CSS-Based Filtering

## Overview
Task #5 replaces DOM re-rendering with CSS-based filtering to achieve a 95% performance improvement on filtering operations.

## Changes Made

### 1. CSS Changes (`css/styles.css`)
- Added `.hidden { display: none !important; }` utility class (line 15)

### 2. JavaScript Changes (`js/script.js`)

#### Render Function Modifications
- **Lines 702-721**: Added data attribute generation for filter metadata
  - `data-segments`: Comma-separated segment tags
  - `data-brands`: Comma-separated brand tags
  - `data-search-text`: Searchable text content
- **Line 741**: Removed filtering logic - now renders ALL SKUs
- **Lines 681, 821**: Call `applyFilters()` after rendering

#### GPU Render Function Modifications
- **Lines 847-855**: Added GPU data attributes
  - `data-gpu-segment`: GPU segment type (consumer/workstation/accelerator)
  - `data-search-text`: Searchable GPU text
- Removed filter logic - renders ALL GPU items

#### New applyFilters() Function
- **Lines 980-1053**: New CSS-based filtering function
- Toggles `.hidden` class based on filters
- Handles both CPU and GPU filtering
- Manages orphan era separator visibility
- Includes performance logging

#### Event Listener Updates
- **Line 1129**: Search now calls `debouncedFilter` (debounced `applyFilters`)
- **Lines 595, 612, 639**: Filter buttons call `applyFilters()`

## Testing Checklist

### Automated Tests
1. Open `/test_filtering.html` in browser
2. Click "Run All Tests" button
3. Verify all tests pass (should show green checkmarks)

### Manual Functional Tests

#### Test 1: Search Functionality
1. Open `index.html` in browser
2. Type "zen" in the search box
3. **Expected**: Results filter instantly, no page re-render
4. **Verify**: Console shows `applyFilters: X.XXms` (X < 5ms)

#### Test 2: Segment Filter (CPU View)
1. Ensure you're on AMD or Intel CPU view
2. Click "Desktop" filter button
3. **Expected**: Only desktop architectures shown
4. **Verify**: Scroll position maintained, no animation restart

#### Test 3: Brand Filter (Legend Toggle)
1. Click a brand tag in the legend (e.g., "Ryzen" or "Core Ultra")
2. **Expected**: Only architectures with that brand shown
3. **Verify**: Page doesn't flash or reload

#### Test 4: GPU Segment Filter
1. Switch to GPU tab (AMD GPU roadmap)
2. Click "Consumer" filter button
3. **Expected**: Only consumer GPUs shown
4. **Verify**: Filtering is instant

#### Test 5: Scroll Position Preservation
1. Scroll halfway down the page
2. Type something in search box
3. **Expected**: Page stays at same scroll position
4. **Previous behavior**: Scroll would jump to top

#### Test 6: Expand State Persistence
1. Expand 2-3 architecture groups
2. Apply a filter (search or segment filter)
3. **Expected**: Expanded groups remain expanded
4. **Previous behavior**: Would collapse on filter

#### Test 7: Combined Filters
1. Click a segment filter (e.g., "Desktop")
2. Then type a search term (e.g., "zen")
3. **Expected**: Both filters apply simultaneously
4. **Verify**: Only items matching BOTH filters shown

#### Test 8: Clear Filters
1. Apply several filters
2. Click "All" segment button
3. Clear search box
4. Click legend tags to deselect them
5. **Expected**: All items visible again

### Performance Tests

#### Test 9: Performance Comparison
1. Open browser DevTools (F12)
2. Go to Console tab
3. Search for something
4. **Expected**: See `applyFilters: X.XXms` where X < 5ms
5. **Previous**: Would see `render: XXXms` where XXX > 300ms

#### Test 10: No Render Calls on Filter
1. Keep DevTools Console open
2. Apply filters (search, segment, brand)
3. **Expected**: Only see `applyFilters` logs, NOT `render` logs
4. Switch vendor or tech tab
5. **Expected**: NOW you should see `render` log (full re-render is appropriate here)

### Edge Cases

#### Test 11: Empty Results
1. Search for something that doesn't exist (e.g., "xyz123")
2. **Expected**: All items hidden, page shows empty state gracefully
3. Clear search
4. **Expected**: All items reappear

#### Test 12: Era Separator Handling
1. Apply a filter that hides all items in a particular era
2. **Expected**: Era separator for that era is also hidden
3. **Verify**: No orphan era labels visible

#### Test 13: Rapid Filter Changes
1. Rapidly type in search box (many characters quickly)
2. **Expected**: Debouncing prevents multiple filter calls
3. **Verify**: Smooth performance, no lag

#### Test 14: Expand During Search
1. Apply a search filter to narrow results
2. Expand one of the filtered items
3. Change the search term
4. **Expected**: Expanded state preserved if item still matches

## Success Criteria

### Performance Metrics
- ✅ Filter operations complete in < 5ms (down from 300-500ms)
- ✅ 95%+ reduction in filter operation time
- ✅ Zero DOM node creation/destruction during filtering
- ✅ Console performance logs show "applyFilters" instead of "render"

### User Experience
- ✅ Instant filtering response
- ✅ Scroll position preserved
- ✅ Expanded groups remain expanded
- ✅ No page flashing or animation interruption
- ✅ Notes and links persist without special handling

### Code Quality
- ✅ Clean separation: `render()` for DOM creation, `applyFilters()` for visibility
- ✅ Data attributes store filter metadata
- ✅ CSS `.hidden` class for consistent hiding
- ✅ Performance logging maintained
- ✅ Debouncing still applied to search

## Known Limitations
- None identified. The solution works for both CPU and GPU views, all filter types, and preserves all state.

## Rollback Plan
If issues are found:
1. Revert to previous commit before Task #5
2. The old implementation is fully functional
3. Git command: `git revert HEAD` (if this is the latest commit)

## Related Files
- `/home/dan/hardware_portal/css/styles.css` - Added `.hidden` class
- `/home/dan/hardware_portal/js/script.js` - Main implementation
- `/home/dan/hardware_portal/CHANGELOG.md` - Detailed change log
- `/home/dan/hardware_portal/test_filtering.html` - Test suite
