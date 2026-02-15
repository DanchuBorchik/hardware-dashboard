# Mobile Testing Guide

## Overview
This document provides testing guidelines for the mobile-responsive features of the Hardware Portal dashboard.

## Test URL
`http://192.168.1.236:8084`

## Test Devices / Breakpoints

### Small Mobile (375px and below)
- iPhone SE, iPhone 12 Mini
- Samsung Galaxy S8
- Test the smallest screen sizes

### Mobile (376px - 640px)
- iPhone 12, iPhone 13, iPhone 14
- Most standard smartphones
- Primary mobile breakpoint

### Tablet (641px - 768px)
- iPad Mini
- Small tablets in portrait mode
- Transition between mobile and desktop

### Desktop (769px and above)
- Full desktop experience
- No mobile-specific changes

## Critical Features to Test

### 1. Table Horizontal Scrolling (PRIMARY FIX)
**Issue Fixed:** Tables weren't scrolling horizontally on mobile

**Test Steps:**
1. Open site on mobile device or use browser DevTools mobile emulation
2. Switch to AMD vendor tab
3. Expand any architecture (e.g., "Zen 5 - Granite Ridge")
4. Click on a SKU card with specs (e.g., "Ryzen 9 9950X")
5. Verify the CPU spec table scrolls horizontally
6. Test smooth momentum scrolling on iOS devices

**Expected Behavior:**
- Table container shows horizontal scrollbar
- Smooth touch scrolling on mobile devices
- All columns accessible via horizontal scroll
- Scrollbar visible (8px height, enhanced contrast)

### 2. GPU Spec Tables
**Test Steps:**
1. Switch to AMD vendor
2. Switch to GPU tab
3. Expand any GPU architecture
4. Scroll the GPU spec table horizontally

**Expected Behavior:**
- Similar scrolling behavior as CPU tables
- Smooth momentum scrolling on iOS
- All columns accessible

### 3. Codename Quick Reference Table
**Test Steps:**
1. Switch to AMD vendor
2. Expand the "Codename Quick Reference" table
3. Scroll horizontally if needed

**Expected Behavior:**
- Table scrolls horizontally on narrow screens
- Touch scrolling works smoothly
- Table remains readable on mobile

### 4. Touch Target Sizes
**Test Steps:**
1. Try tapping all interactive elements:
   - Vendor tabs (AMD / Intel)
   - Tech tabs (CPU / GPU)
   - Filter buttons
   - Legend items
   - Expand/Collapse buttons
   - Architecture headers

**Expected Behavior:**
- All buttons have minimum 44x44px tap targets (WCAG compliance)
- Easy to tap without accidentally hitting adjacent buttons
- No need for precise tapping

### 5. Layout Adaptations

#### Mobile Layout (640px and below)
**Test Steps:**
1. Verify the following layout changes:
   - SKU cards display in single column
   - Timeline dots are smaller
   - Architecture segment badges are hidden
   - Font sizes are reduced appropriately
   - Search input takes full width

**Expected Behavior:**
- Clean, readable single-column layout
- No horizontal overflow of content
- Comfortable text sizes for mobile reading

#### Tablet Layout (768px and below)
**Test Steps:**
1. Verify intermediate layout:
   - SKU cards in single column
   - Slightly reduced font sizes
   - Filter controls wrap properly

**Expected Behavior:**
- Smooth transition from desktop to mobile
- No awkward spacing or overflow

### 6. Filter Controls
**Test Steps:**
1. Test all filter interactions on mobile:
   - Segment filters (Desktop, Laptop, Server, etc.)
   - Legend tag toggles
   - Search input
   - Year range filters

**Expected Behavior:**
- Filter buttons wrap to multiple rows on narrow screens
- Search input remains usable
- Filter state preserved (CSS-based filtering)
- No performance issues

### 7. Expand/Collapse Functionality
**Test Steps:**
1. Expand multiple architecture cards
2. Apply filters
3. Change vendors
4. Verify smooth animations

**Expected Behavior:**
- Touch gestures work for expand/collapse
- Animation timing remains at 0.45s
- State preserved during filtering
- No lag or stuttering

### 8. Search Functionality
**Test Steps:**
1. Type in search box on mobile
2. Test debouncing (300ms delay)
3. Search for various terms

**Expected Behavior:**
- On-screen keyboard appears
- Search input field remains focused
- Debouncing prevents excessive re-filtering
- Results update smoothly

## Browser Testing

### Required Browsers
- Safari (iOS) - Primary mobile browser
- Chrome (Android) - Primary Android browser
- Firefox Mobile
- Samsung Internet

### Desktop Mobile Emulation
**Chrome DevTools:**
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select device preset or custom dimensions
4. Test at: 375px, 414px, 640px, 768px

**Firefox Responsive Design Mode:**
1. Open Developer Tools (F12)
2. Toggle Responsive Design Mode (Ctrl+Shift+M)
3. Test same breakpoints as Chrome

## Performance Testing

### Expected Performance
- CSS-based filtering: <5ms
- Search with debouncing: 300ms delay
- Table scrolling: 60fps smooth
- Expand/collapse: 450ms animation

### Test Scenarios
1. Apply multiple filters rapidly
2. Search while expanded cards are visible
3. Scroll tables while filtering
4. Switch vendors with expanded cards

**Expected Behavior:**
- No lag or stuttering
- Scroll position preserved
- Expand state maintained
- No DOM re-rendering during filtering

## Known Limitations

### Intentional Design Decisions
1. Segment badges hidden on mobile (<640px) - saves space
2. Single-column layout below 768px - improves readability
3. Reduced font sizes on mobile - fits more content
4. Smaller timeline dots on mobile - compact design

### Browser-Specific Notes
- iOS Safari: -webkit-overflow-scrolling: touch provides momentum scrolling
- Android Chrome: Uses standard touch scrolling
- Desktop emulation: May not perfectly replicate touch behavior

## Regression Testing

### Before Deployment, Verify:
1. Desktop layout unchanged (>768px)
2. All existing features work
3. Performance optimizations intact
4. Expand/collapse state preserved
5. CSS-based filtering still functions
6. Search debouncing active

## Troubleshooting

### Tables Not Scrolling
- Check if `.cpu-spec-overflow` or `.gpu-spec-overflow` has `overflow-x: auto`
- Verify `-webkit-overflow-scrolling: touch` is present
- Check browser console for CSS errors

### Buttons Too Small
- Verify `min-height: 44px` applied to interactive elements
- Check media query breakpoints are correct
- Test with actual device (not just emulation)

### Layout Breaks at Certain Width
- Check media query boundaries (375px, 640px, 768px)
- Verify no conflicting CSS rules
- Test with browser DevTools at exact breakpoint

### Performance Issues
- Confirm CSS-based filtering still in use (no re-rendering)
- Check browser console for JavaScript errors
- Verify debouncing is active (300ms delay)

## Success Criteria

### All Tests Must Pass:
- [x] CPU spec tables scroll horizontally on mobile
- [x] GPU spec tables scroll horizontally on mobile
- [x] Codename table scrolls horizontally on mobile
- [x] All buttons have 44x44px minimum touch targets
- [x] Single-column layout below 768px
- [x] Smooth touch scrolling on iOS
- [x] No horizontal content overflow
- [x] Filter controls wrap properly
- [x] Search input is touch-friendly
- [x] Expand/collapse works on touch devices
- [x] Performance optimizations preserved

## Additional Resources
- Project MEMORY.md: `/home/dan/.claude/projects/-home-dan-hardware-portal/memory/MEMORY.md`
- Performance Audit: `/home/dan/hardware_portal/docs/AUDIT-2026-02-14.md`
- CHANGELOG: `/home/dan/hardware_portal/CHANGELOG.md`
