Original prompt: 我现在想将我的3D Antarctica Explorer升级为3D Antarctica&Greenland Explorer，添加选项，用户可以自由切换显示Antarctica或Greenland，我在下面的文件夹内为你准备好了所需的BedMachineGreenland数据，先实现基础的Greenland Ice和bed显示功能：

/Users/eddie/Library/CloudStorage/OneDrive-UniversityofTasmania/Documents/Greenland_Dateset/BedMachineGreenland

- 2026-03-07: Inspected current explorer structure. Main entry is `/Users/eddie/Documents/yuwang115.github.io/static/tools/antarctica-bedmachine-3d.html`, with terrain packaged as `meta.json + bin`.
- 2026-03-07: Confirmed Greenland source folder contains `BedMachineGreenland-v6.nc` and metadata sidecars, but browser cannot consume them directly.
- 2026-03-07: Plan is to reuse the Antarctica terrain packaging format for Greenland, then add a region selector in the explorer and disable unsupported Greenland overlays for now.
- 2026-03-07: Added `scripts/prepare_bedmachine_greenland.py` and generated `static/tools/data/bedmachine_greenland_v6_3km.meta.json` + `.bin` plus `static/tools/data/bedmachine_greenland_v6_1km.meta.json` + `.bin` from `BedMachineGreenland-v6.nc`.
- 2026-03-07: Updated `/Users/eddie/Documents/yuwang115.github.io/static/tools/antarctica-bedmachine-3d.html` to support Antarctica/Greenland region switching, dynamic resolution options, region-aware metadata, and Greenland-only capability gating for unsupported overlays.
- 2026-03-07: Added minimal `window.render_game_to_text` and `window.advanceTime` hooks for browser automation checks.
- 2026-03-07: Verified with Playwright that `?region=greenland` renders correctly and that UI-based switching Antarctica -> Greenland -> Antarctica works without console errors. Screenshots saved under `/Users/eddie/Documents/yuwang115.github.io/output/ui-region-switch/`.
- 2026-03-07: Replaced Greenland's single 3.6 km preset with two presets: 3 km and 1 km. Verified Greenland 3 km -> 1 km -> 3 km switching in-browser.
- 2026-03-07: Removed the extra right-aligned Region/Resolution label values from the control panel so only the dropdowns show the current selection.
- TODO: Add Greenland velocity / flowline / hydrology layers when matching source datasets are prepared.
- TODO: Consider a Greenland HD preset if higher local detail is needed.
