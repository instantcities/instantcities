// venice: the traffic lights and crossings, made by `node tools/crossings.mjs venice`, do not edit by hand.
// Map data © OpenStreetMap contributors, available under the Open Database License (ODbL).
// x, z, y: game metres, on the street's middle line. a: the way the street runs (radians, atan2(z, x)),
// w: its width. A light's d: the traffic it is for runs along a (1), against it (-1) or both (0);
// j: its junction, ph: its turn there (0 or 1), ped: a crossing for people on foot too, back: how
// far before it (along its traffic) the stop line is.
// A crossing's k: 'zebra' (stripes) or 'bike' (squares along both edges).
export const SIGNALS = [];
export const CROSSINGS = [];
