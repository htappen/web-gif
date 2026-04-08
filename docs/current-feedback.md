# Overview
This is a living file that describes the overall problems I see with the web app. You should add a tag to each line as you fix it, and I will erase the line when verified.

# Problems
- The video preview doesn't appear to respect aspect ratios. If a tall video is in there, the whole video should fit into the preview box, not truncate it. [FIXED]
- The crop box appears to progressively shrink as it is moved towards the edge of the preview box. Instead, it should snap its size to the edge upon releasing the mouse if any portion of the box is outside the region. [FIXED]
- The crop box in the preview has a strange icon in it. Remove the icon from the box. [FIXED]
- The icon for the crop control is strange. Just replace it with a square. [FIXED]
- NEEDS TEST: video playback appears to be extremely jittery in the preview window, even with local files. [FIXED]
- When the page first loads, it should not download the sample video. Only download the video (and open it) if the user clicks the "Sample video" button. [FIXED]
- Switch the sample video to use big_buck_bunny.mp4 [FIXED]
