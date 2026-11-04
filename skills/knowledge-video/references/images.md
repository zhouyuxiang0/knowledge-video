# Images in detail

## Real images → `images.md`

- **Licenses**: prefer public domain and CC0; CC BY and CC BY-SA are fine with credit, and a modified CC BY-SA image is shared under the same license. Skip "all rights reserved", unknown-source and non-commercial-only images; list them under "not used" with the reason
- Take the license from the file page. Wikimedia Commons: `https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=extmetadata&format=json&titles=File:NAME`, read `LicenseShortName` and `Artist`
- For each: the URL (its file page), which part, which scene and screen, license, author; write credit text ready for the description
- Flag easy mismatches: same model but not the same machine, a later interface version… so on-screen text never claims "this is the one"
- Use the project's agreed acquisition route; keep source links and license records beside the assets.
- Real people who are named: use a freely licensed photo if one exists; otherwise just their name, never an AI-drawn face

## AI-generated illustrations → `image-prompts.md`

- Use the image tools available in the session, following the user's chosen route. Prefer built-in image generation when available; use the user's own tool when requested or when generation is unavailable. Validate a representative asset before expanding the set. A paid API fallback needs the applicable authorization.
- **One style prefix** on every prompt so the video looks drawn by one hand: style, palette (name the colors), paper and print texture, "no text, no logos, no watermark"
- **Layers**: separate subjects that must move independently and provide complete joint overlap for rigged characters. Request actual alpha transparency when supported. Preserve the original asset and use the selected tool's supported background-removal route when necessary; do not introduce another rendering engine for this step.
- No text in images: titles, names and numbers are typeset in code. Image models misspell, and a realistic fake headline or paper page misleads
- People as backs, silhouettes, hands, or generic people who aren't anyone real
- For a crowd with readable faces, plan enough distinct identities for the visible group before duplicating sprites. Vary facial shape, age, hair and clothing together; tinting one face or changing scale does not remove a clone effect. Keep principal characters unique, avoid adjacent repeats, and inspect the distribution in the actual wide and close shots. Size the asset set to the shot, not a fixed character count.
- When adding identities to an accepted rig, preserve the pose, joint locations, framing and alpha gaps; first check one edited atlas in the scene before expanding the set. Recheck shoulders, hands, feet and occlusion after integration without changing an already accepted gait to compensate for an ill-fitting image.
- Each entry: file name (scene number first), orientation and rough size, transparent or full-frame, the full prompt, which scene and screen
- Check the pixels available to each visible part at the largest planned shot, not just the atlas's total dimensions. A large full-body sheet can still contain a small, blurry head. When a close shot exceeds that detail, prepare a matching dedicated head or expression atlas; align scalp, chin, ears and neck with the accepted rig, then inspect all expressions and their transitions in the actual scene. Enlarging or sharpening the old crop does not restore missing detail.
- When images arrive, trim the transparent padding to the opaque pixels before placing them; generated images carry wide margins and push subjects off screen
- Record generation provenance and prompts in `credits.md`. Public description text, platform labels and publishing actions follow the approved publication workflow.
