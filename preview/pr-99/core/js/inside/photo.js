// The real picture over the drawing: the photo of a famous piece from Wikimedia Commons (on the
// site at assets/img/art/<id>.jpg, its page /art/<id>/, both from tools/art.mjs) painted onto the
// canvas a texture was drawn on (art.js, lamgods.js). Until it has loaded, and for good where it
// cannot (offline, say), the drawing from memory hangs there instead.
//
//     photo(tex, 'mona-lisa')                                   the whole canvas, cropped to fill it
//     photo(tex, 'ghent-altarpiece', { fit: 'contain', ground: '#3b2616' })   all of it, on a ground
//     photo(tex, 'the-creation-of-adam', { rect: [x, y, w, h], turn: true, stretch: 2 })
//         only into that part of the canvas, turned a quarter clockwise, on a canvas whose pixels
//         show `stretch` times as tall as wide where it hangs (a vault's)
//
// A canvas that is all the photo grows to the photo's own sharpness (up to MAX pixels along its
// longer side), keeping its shape; one with a rect keeps its size and the rest of its drawing.
const BASE = new URL('/assets/img/art/', import.meta.url);
const MAX = 1024;

export function photo(tex, id, { fit = 'cover', ground = '#000', rect = null, turn = false, stretch = 1 } = {}) {
  if (typeof Image === 'undefined') return tex;
  const img = new Image();
  img.decoding = 'async';
  img.onload = () => {
    const c = tex.image, g = c.getContext('2d');
    let [x, y, w, h] = rect ?? [0, 0, c.width, c.height];
    if (!rect) {
      const k = Math.min(MAX, Math.max(img.width, img.height)) / Math.max(c.width, c.height);
      c.width = w = Math.round(c.width * k);
      c.height = h = Math.round(c.height * k);
    }
    // the photo's width and height across the canvas, in its pixels; cover: it fills the place,
    // its overhang cut off; contain: all of it, the ground round it
    const iw = turn ? img.height : img.width, ih = (turn ? img.width : img.height) / stretch;
    const s = (fit === 'cover' ? Math.max : Math.min)(w / iw, h / ih), dw = iw * s, dh = ih * s;
    g.save();
    g.beginPath(); g.rect(x, y, w, h); g.clip();
    if (fit !== 'cover') { g.fillStyle = ground; g.fillRect(x, y, w, h); }
    g.translate(x + w / 2, y + h / 2);
    if (turn) { g.rotate(Math.PI / 2); g.drawImage(img, -dh / 2, -dw / 2, dh, dw); }
    else g.drawImage(img, -dw / 2, -dh / 2, dw, dh);
    g.restore();
    // a canvas of another size needs a new texture on the card: let go of the old one first
    if (!rect) tex.dispose();
    tex.needsUpdate = true;
  };
  img.src = new URL(`${id}.jpg`, BASE).href;
  return tex;
}
