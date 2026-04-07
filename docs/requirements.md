# Requirements
## Overview
This is a single page javascript app that runs entirely in the browser. It allows the user to select a video (in any format supported by FFMPEG) and convert it to another format supported by FFMPEG. It also supports converting to a gif. Users can also apply basic transformations to the video, including viewport 
cropping, truncating, rotating, and inserting text over the video.

## User flow
1. User loads the page. A box appears centered on the screen. Inside the box is the text Loading, update text beneath that describes the part being loaded (e.g. FFMPEG libraries). A progress bar underneath loads to fully
2. The page has two elements: a video viewing / manipulation canvas, and a set of output options. We'll talk through the flow for both of them.
3. The video viewing / manipulation canvas is on the left. At first, it includes only a button to select a video or a place to drag / drop a video into it. THe user can, at any time, drag / drop another video into the same place to load a new one. The button will also move to the bottom of the controls -- more on that in a moment. While a video loads, the text in the canvas switches to "Loading", and shows a loading bar with the progress.
4. Once the video has loaded, it shows up as a video with the 1st frame at a still image. 
    1. The video itself has a play button overlaid. When clicked, the video starts looping. Clicking the video again pauses it. 
    1. The bottom of the video has a slider with two controls -- one dot for seeking to the length of the video, and also two brackets for truncating the video to start or end. Moving the dot should seek to the frame in the video. The dot should always be bumped to stay inside the brackets.
5. Beneath the video, the user has the following controls:
    1. A checkbox for "crop". The checkbox should look like a toggle button, with the word "Crop" next to it and a "frame" icon depicting crop to the left of the toggle. When checked, a box appears over the video. Users can move the box by grabbing the corners or edges of it to resize it. Remove the box when unchecked.
    1. A drop-down for rotation. It should have the text "Rotation", a "rotate" icon, and a drop down with the options 0, 90, 180 and 270 degrees (use a degree symbol next to each one)
    1. A toggle for text. When checked, a drop-downs appear beneath it for (a) Font, (b) Size (in px), and (c) a text box for the words. The text, in the chosen font, size, and text should show up as an overlay in the video. There is a cross in the upper left hand portion of the text that the user can move as an anchor point to choose where it appears.
6. To the right of the video on a wide screen the user has controls for choosing the output. This region should be fixed size, taking up about 200px. They have a drop down to choose the format: gif or mp4. Beneath it they have controls for selecting the following:
    - Resolution: 180p, 320p, 480p, 720p or 1080p. If the cropped region + video quality don't support a sufficient resolution, disable the otpion
    - Frame rate: slider for 0-60 fps, with also an editable text box showing the slide amount. The two should stay in sync -- changing the text box should change the slider.
    - Convert: when clicked, a placeholder element appears below the box. While processing, there should be a progress bar in place. Once it's finished, replace the placeholder box with the converted video.


## Overall design
- For overall page colors, use shades of purple. Put background elements in dark purple, foreground elements in light purple or lilac, and text in white
- Use a sans serif, modern font for front end
- Make the page responsive -- on desktop, attempt to fit the elements side by side. On mobile, stack them vertically
- Style elements with proper highlight and press states.


## Implementation details
- All video editing should be done in the local browser, no files uploaded anywhere.
- Design the page such that it is not dependent on a webserver like Node.js. You can use Node.js to do basic file serving, but it should be possible to run the page from github.io (which has no dynamic backend)
- Use FFMPEG WASM for actual file conversion
- Copy other backend functionality from https://github.com/PiesP/wasm-motion-converter . Look for options like converting to gif
- Use Tailwind for UI styling, Vite for build, and React for the UI framework.
- Create a proper directory structure, with different UI controls in different files, etc.
- Code the app in Typescript

## Work plan
1. Start by creating the initial page flow and UI so I can walk through it. Implement downloading all the libraries and the controls, but don't yet implement the conversion. Use a sample MOV file: https://file-examples.com/index.php/sample-video-files/sample-mov-files-download/ to display in the app.
2. Once the UI looks good, we'll proceed to implementing all the conversions via FFMpeg.
3. For tests, validate that the FFMPEG commands in the browser work correctly. You can test them using the ffmpeg libraries installed locally on the dev box (as command line tols)