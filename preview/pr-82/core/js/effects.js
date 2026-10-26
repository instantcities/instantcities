import * as THREE from 'three';

function softDot() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.55, 'rgba(255,255,255,0.85)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Ring buffer of soft round puffs that always face the camera: hoof dust, fur bursts, rain, confetti.
export class Particles {
  constructor(scene, max = 320) {
    const map = softDot();
    this.items = [];
    this.next = 0;
    for (let i = 0; i < max; i++) {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map, color: 0xffffff, transparent: true, depthWrite: false }));
      sprite.visible = false;
      scene.add(sprite);
      this.items.push({ sprite, alive: false, age: 0, life: 1, vx: 0, vy: 0, vz: 0, size: 1, grow: 0, gravity: 0, drag: 0, opacity: 1 });
    }
  }

  spawn(x, y, z, o = {}) {
    const p = this.items[this.next];
    this.next = (this.next + 1) % this.items.length;
    p.alive = true;
    p.age = 0;
    p.life = o.life ?? 0.6;
    p.vx = o.vx ?? 0; p.vy = o.vy ?? 0; p.vz = o.vz ?? 0;
    p.size = o.size ?? 0.3;
    p.grow = o.grow ?? 0;
    p.gravity = o.gravity ?? 0;
    p.drag = o.drag ?? 0;
    p.opacity = o.opacity ?? 1;
    p.sprite.material.color.set(o.color ?? 0xffffff);
    p.sprite.material.opacity = p.opacity;
    p.sprite.position.set(x, y, z);
    p.sprite.scale.setScalar(p.size * 2);
    p.sprite.visible = true;
  }

  burst(x, y, z, count, o = {}) {
    const speed = o.speed ?? 6;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, up = Math.random();
      this.spawn(x, y, z, {
        ...o,
        vx: Math.cos(a) * speed * (0.4 + Math.random() * 0.6),
        vy: (o.up ?? 3) * (0.5 + up),
        vz: Math.sin(a) * speed * (0.4 + Math.random() * 0.6),
        color: Array.isArray(o.color) ? o.color[i % o.color.length] : o.color,
      });
    }
  }

  update(dt) {
    for (const p of this.items) {
      if (!p.alive) continue;
      p.age += dt;
      if (p.age >= p.life) { p.alive = false; p.sprite.visible = false; continue; }
      const k = p.age / p.life, damp = Math.exp(-p.drag * dt), s = p.sprite;
      p.vx *= damp;
      p.vz *= damp;
      p.vy = p.vy * damp - p.gravity * dt;
      s.position.x += p.vx * dt;
      s.position.y = Math.max(0.05, s.position.y + p.vy * dt);
      s.position.z += p.vz * dt;
      s.scale.setScalar((p.size + p.grow * k) * 2);
      s.material.opacity = p.opacity * (1 - k * k);
    }
  }
}
