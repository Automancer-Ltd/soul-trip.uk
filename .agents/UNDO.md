# Undo: mobile navigation outside-click dismissal

Revert the merge commit with `git revert -m 1 <merge-sha>` and let the normal GitHub Pages workflow publish and verify the prior tree. The change is confined to the document click handler in `assets/js/main.js`; no data or service configuration changed.
