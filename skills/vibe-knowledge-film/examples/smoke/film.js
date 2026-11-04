/* Technical smoke test only: a moving block, a label and one event sound. */
(() => {
  'use strict';
  VK.film({
    dur: 2,
    theme: 'flat',
    meta: {title: 'Render smoke test', drone: 0},
    draw(fr, t) {
      fr.look.bgo = {color: '#f2eee4'};
      fr.look.bloom = 0;
      fr.look.grain = 0;
      const x = VK.lerp(400, 1400, VK.ss(t, 0, 2));
      fr.rect(x, 350, 120, 180, {fill: '#39796b', color: '#224d43', w: 3});
      fr.line(300, 550, 1600, 550, {color: '#39796b', w: 4});
      fr.text('Render smoke test', 960, 210, {font: 'mono', size: 48, color: '#224d43'});
      fr.sfx(0.5, 'tick', {gain: 0.2});
    },
  });
})();
