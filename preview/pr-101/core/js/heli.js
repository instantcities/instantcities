import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { painter } from './scenery.js';

// The police helicopter of the rescue quest: white, a blue band down the side, the cockpit's dark
// glass at the front (+z, the way it faces at yaw 0), on two skids. The rotors are meshes of their
// own, to spin (userData.spin), and the winch rope hangs from the side door (userData.rope).
const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0.1 });

function mesh(make) {
  const parts = [];
  make(painter(parts));
  return new THREE.Mesh(mergeGeometries(parts), material);
}

export function helicopter() {
  const white = 0xf4f5f2, blue = 0x1f4e9c, glass = 0x1d2a38, grey = 0x4a4f55, yellow = 0xf6c700;
  const group = new THREE.Group();
  const body = mesh(paint => {
    paint(new THREE.SphereGeometry(1, 16, 12).scale(1.45, 1.35, 2.6).translate(0, 1.9, 0.4), white); // the cabin
    paint(new THREE.SphereGeometry(1, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.42).rotateX(Math.PI / 2).scale(1.3, 1.15, 1.6).translate(0, 2.05, 1.7), glass); // the cockpit's glass
    paint(new THREE.BoxGeometry(2.95, 0.42, 4.6).translate(0, 1.55, 0.3), blue); // the band down both sides
    paint(new THREE.BoxGeometry(2.97, 0.12, 4.6).translate(0, 1.82, 0.3), yellow);
    paint(new THREE.BoxGeometry(0.06, 1.1, 1.2).translate(1.42, 1.95, -0.2), glass); // the side door's windows
    paint(new THREE.BoxGeometry(0.06, 1.1, 1.2).translate(-1.42, 1.95, -0.2), glass);
    paint(new THREE.CylinderGeometry(0.28, 0.55, 6.2, 10).rotateX(Math.PI / 2).translate(0, 2.35, -4.6), white); // the tail boom
    paint(new THREE.BoxGeometry(0.16, 1.9, 1.1).translate(0, 3.1, -7.5), blue); // the fin
    paint(new THREE.BoxGeometry(2.2, 0.12, 0.6).translate(0, 2.4, -6.6), white); // the tailplane
    paint(new THREE.CylinderGeometry(0.42, 0.55, 0.6, 10).translate(0, 3.35, 0.2), grey); // the engine on top
    paint(new THREE.CylinderGeometry(0.12, 0.12, 0.7, 6).translate(0, 3.9, 0.2), grey); // the mast
    for (const s of [-1, 1]) {
      paint(new THREE.CylinderGeometry(0.09, 0.09, 4.6, 6).rotateX(Math.PI / 2).translate(s * 1.25, 0.1, 0.4), grey); // the skids
      paint(new THREE.CylinderGeometry(0.07, 0.07, 1.2, 6).rotateZ(s * 0.35).translate(s * 1.1, 0.65, 1.6), grey); // and their legs
      paint(new THREE.CylinderGeometry(0.07, 0.07, 1.2, 6).rotateZ(s * 0.35).translate(s * 1.1, 0.65, -0.8), grey);
    }
  });
  group.add(body);
  const rotor = mesh(paint => {
    paint(new THREE.BoxGeometry(11.5, 0.06, 0.38).translate(0, 4.25, 0), grey);
    paint(new THREE.BoxGeometry(0.38, 0.06, 11.5).translate(0, 4.25, 0), grey);
  });
  rotor.position.z = 0.2;
  group.add(rotor);
  const tail = mesh(paint => {
    paint(new THREE.BoxGeometry(0.05, 1.7, 0.18), grey);
    paint(new THREE.BoxGeometry(0.05, 0.18, 1.7), grey);
  });
  tail.position.set(0.2, 3.1, -7.5);
  group.add(tail);
  // the winch rope, out of the right-hand door, one metre long until it is let down
  const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1, 4).translate(0, -0.5, 0), new THREE.MeshBasicMaterial({ color: 0x222222 }));
  rope.position.set(1.6, 1.6, -0.2);
  rope.visible = false;
  group.add(rope);
  group.userData.spin = (t, power) => {
    rotor.rotation.y = t * (6 + power * 18);
    tail.rotation.x = t * 40;
  };
  group.userData.rope = len => {
    rope.visible = len > 0.2;
    rope.scale.y = Math.max(0.01, len);
  };
  return group;
}

// Its shadow, a soft dark blot under it, about its own size (the cabin and the tail boom behind it):
// lying flat, drawn over the ground without fighting it.
export function heliShadow() {
  const mat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 });
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(4.5, 24).rotateX(-Math.PI / 2).scale(0.5, 1, 1.2).translate(0, 0, -1.8), mat);
  shadow.renderOrder = 1;
  return shadow;
}
