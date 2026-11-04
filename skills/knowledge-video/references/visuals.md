# Visuals: approaches, validation and lessons from tested videos

Design each video for its own topic. Historical examples describe what worked in those cases, not universal rules. A newly observed reference technique remains a candidate until tested in the current work; a successful sample does not establish an audience or growth effect.

## Choose the medium for the scene

Choose illustration, character animation, flat motion graphics, source footage or 3D from the scene's meaning and the user's visual direction before choosing an engine. A conversation may benefit from expressive illustration and readable chat animation; a comparison from a flat diagram; an internal structure or spatial movement from 3D. These are options, not a fixed allocation. State what the chosen treatment makes clearer or contributes to the intended experience. An available character, room or camera rig is not by itself a reason to use 3D across the film. Keep palette, character identity and transitions coherent when combining media; local depth does not require rebuilding every scene in 3D.

## Validate an approach borrowed from a reference

- Record the observable technique and the specific problem it might solve in the existing storyboard or review notes. Separate observation from the hypothesis about viewers. A popular creator's palette, rendering medium or cumulative likes do not establish why a video worked. Keep a project's pending candidates and chosen references in project records, not as a universal house style.
- Choose applicable candidates by scene: action, consequence and readable reaction for an interaction; the same object under changing conditions for a mechanism; clearer subject scale and fewer competing text layers for attention. Do not require every scene to use all three. Decorative movement or a more detailed background is not evidence that the intended change is easier to understand.
- Test the selected method in the representative continuous sample before expanding it. Use the same passage and narration for a visual comparison where useful; do not rewrite the script, replace the voice or make two full films just to test staging. Cover the hardest explanatory transition as well as character performance when both matter. Let the complete event determine the sample's length.
- Inspect the actual export at the intended display size: can the viewer identify the situation and see what changes; are the necessary face, hand, object and result visible at the relevant moment; does attention follow the explanation; can required labels and subtitles be read together; do character, background and diagrams share a coherent visual language? Temporarily hiding captions can reveal overreliance on text, but is only a diagnostic: exact claims, data and conditions may properly require labels. Recheck scientific boundaries and actual sound-picture coordination.
- Record the file/version, time range, viewing method, observed difference and defects. Use `pending`, `supported in this sample`, or `revise` for the production hypothesis; record user acceptance and audience evidence separately. Fix observed defects and inspect the changed sample before scaling up. If continuous viewing or phone checks were unavailable, leave those dimensions pending rather than promoting still-frame findings to a full pass.
- After testing, update the relevant guidance with the supported technique, its scope and the earliest useful check; revise or discard unsupported candidates. A sample can support readability or performance under the observed conditions without proving higher retention or likes. Growth claims need comparable observation windows, actual view denominators and repeated audience evidence; unavailable playback data remain unknown, never zero. Preserve publication authorization boundaries.

## Dense collage (tested 2025-10, approved by the author)

What "lots of cut-outs layered together" / "the Vox look" turned into: one full-frame scene background per scene (torn paper, halftone, old newspaper in the corners), 3–6 transparent subjects on top, scraps flying in at the corners; one torn-paper title label per scene (4–6 words) and each screen's line in a black subtitle bar at the bottom (key word highlighted); four parallax layers (background, subjects, foreground subjects, scraps) drifting; comparisons told with the picture (a person at a fork in the road, a robot arm playing Go…); a retro palette (cream, red-orange, navy, mustard) in the image-prompt prefix; number stamps, handwritten notes, logo tags and torn-paper cards drawn in code.

Movements that video used (examples, not a checklist): slow push-in on backgrounds, subject layers bobbing, scraps fluttering, titles popping in letter by letter, the subtitle's key word bouncing, photo cards wobbling as they settle, numbers counting, bars growing, lines drawing, transitions rotating between whip pan, vertical whip and zoom-through. The author's note was "richer motion": the picture shouldn't freeze.

## Make a timeline's moments visible

With years only in the subtitles, viewers lost track of where they were in the history (the author's note). What worked: a big year stamp opening each scene, shrinking into a corner as the screen ends, and a timeline in the corner whose label moves along each scene, visited dots changing color.

## Photo cards for real people

Named people get freely licensed photos as printed photo cards: white border, tape, the name under the photo, a small "photo: author · license · cropped" line; list them in `credits.md` too.

## Generated phone, laptop and terminal screens

- Measure the blank screen first: the largest connected region in the screen's center color (it isn't always pure white); keep text and buttons inside it with `white-space: nowrap`, converting coordinates by the displayed width
- Screens are often in perspective (a skewed quadrilateral): take the four corners and compute a `matrix3d` (a homography, an 8-unknown linear system) that maps the rectangular UI onto it. A plain rectangle on top looked pasted on, and the author noticed at once

## Draw in code what code should draw

Generated images carry scenes and objects; processes (a chain folding bead by bead, bars growing, a dial turning), data (charts, proportions), interfaces (chat windows, terminals, keyboards) and exact pointers (circling one stone, a line to one person) are SVG / DOM, animated from time (one progress value, onUpdate computing every point). The author's words: "where it matters, draw it in code; don't lean only on generated images".

## Red-pen marks on top

Red circles, lines and crosses sit above photo cards, logo tags and stickers (below only titles, year stamps, the timeline and subtitles), or they get hidden.

## Company and product logos

LobeHub's open icons (npm `@lobehub/icons-static-svg`, MIT; `npm pack` gives a folder of SVGs: openai, deepmind-color, deepseek-color, anthropic, claudecode-color, google-color…) as small "logo + name" tags, used only to refer to the company, shape and color unchanged.

## Night-sky particles (the *Information Theory* look, tested 10-06 on *Fish and Bear's Paw*)

The author's verdict on the first version: "the motion barely changes; it looks far worse than *Information Theory*". One scatter plot held the screen for over half the video, the camera never moved, and the background was a single layer of stars. The author found the second version "better, not so stiff". Below is what it did; with a new topic, rethink the pictures for that topic. What carries over is the thinking, not these scenes.

- **Find something that moves for each idea**: "one up, the other down" became a seesaw, "all alike" a row of identical empty shells, "not noticed" a sieve sweeping across. 18 scenes in 3 minutes; no picture held the screen for long
- **The last picture becomes the next** instead of cutting: the title's particles fall into the windows of a night city, then rise from the windows into the plot; the opening seesaw comes back sitting on the red line
- The camera pushes in, pulls out, whips to another scene, and turns 45° and pushes in for the payoff line
- **Light** (technique, useful whatever the topic): a radial-gradient sprite drawn with `lighter` blending (not `shadowBlur` on thousands of dots); lines stroked three times (wide and faint, medium, thin and bright) for glow, with a comet head while drawing; a slowly drifting nebula, three parallax star layers, a few shooting stars, a vignette
- Colors mean something: gold = people still in your eyes, grey-blue = sifted out, pale cyan = taken by someone else, red = the line the sieves drew
- Changes in the data are actions: people sifted out fall like sand, people taken rise away as lanterns, the restoration plays it backwards; the key step of the reasoning is labelled in the picture ("plain, but very kind ✓", "average at both · never noticed ✗")
- Particle title: render the title in the same font to a bitmap and take 1000 points by farthest-point sampling
- **Keep the caption strip clear when the camera pushes in**: a push-in moves the axis and its labels down into the captions (at 80 s the "looks →" label sat on the caption). For each camera keyframe, check where the lowest thing lands: screen y = 540 + (scene y − camera center y) × zoom
- Film grain as one **static** tile at low opacity. Grain that changes every frame bloats the file (1.8 GB for 3 minutes), and the platform's re-encode turns it into blocks


## When a 3D scene still reads as a diagram

- If the viewer asks for stronger spatial depth, test an actual perspective dolly or lateral camera arc with near, middle and far objects. Inspect changing relative size, parallax and occlusion in the rendered sequence; a 3D engine, a rotating sphere or a zoomed flat composition alone does not establish that result.
- Keep the requested illustration palette, contour and paper treatment while changing the staging. Let a shared space occupy the frame when depth is the point; use an explanatory inset only where it adds understanding. Check the subject against captions throughout the camera move, not just at the keyframes.
- Camera motion can change what the viewer sees without changing the mechanism. Label observation positions where needed and distinguish the explanatory observer's view from the moving presentation camera; do not let a more dramatic camera imply a false cause.
