# Overview
This is a living file that describes the overall problems I see with the web app. You should add a tag to each line as you fix it, and I will erase the line when verified.

# Problems
- The FPS text box should have a black background. It also has a text status above it. Make sure (1) the box can only contain numbers between 0-60, (2) the text in the box gets updated when dragging, (3) there is no separate text area above.
- The carets in the drop-down need more space. Make them 20% larger and that they have at least 5px from the right edge
- The behavior of the seek button and trimmers is still not correct. Follow these rules:
  - When the user releases the trim start control, if the frame it's set to is AFTER the current frame, seek to the same frame as the trim start control.
  - When the user releases the trim end control, if the frame it's set to is BEFORE the current frame, seek to the same frame as the trim end control.
  - Otherwise, keep the current frame. Do not move the seek control.