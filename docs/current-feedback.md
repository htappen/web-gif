# Overview
This is a living file that describes the overall problems I see with the web app. You should add a tag to each line as you fix it, and I will erase the line when verified.

# Problems
- [fixed] When the image is rotated, the controls in the crop window rotate as well -- e.g. at 180 degrees, moving the mouse left moves the window right. Instead, the window should always obey absolute clicks. So, at first rotation change, also move the crop window, but thereafter respect the current mouse movements.
- [fixed] Same problem with the web anchor.
- [fixed] Remove the major header section.
- [fixed] Remove the left / right padding -- the output controls should always be anchored the right hand of the screen. Each panel should be independently scrollable.
- [fixed] Move the play / pause button from the upper left of the video frame to the center. Fade it out on mouse out, and fade it in on mouse in.
- [fixed] The controls on the trim range slider should be circles, not round-capped-rectangles as they are today.
- [fixed] Put trim range into the same panel as the video, immediately beneath it.
- The text in the drop-downs is not visible. Make the drop-down background black.
- Change the responsive layout to something like this:
  - When horizontal resolution < 640px, stack all controls in this order, filling the full horizontal space:
    - Video preview panel
    - Video controls (crop, rotate, etc.)
    - Output panel
  - When horizontal resolution is between 640px and 1024px, put the right-hand panel with fixed size (200px) on the right-hand of the screen. In the remaining space, put the video preview screen with the extra controls beneath it.
  - When horizontal resolution >1024px, put the right-hand panel as it is in the previous instruction. Put the video controls with fixed size of 300px to that left. Then, fit the rest of the video preview panel in the available vertical space.
  - Right-hand panel (conversion controls) - on wide screens (1366px or more), put anchor it to the right-hand side
