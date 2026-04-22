const canvas = document.getElementById('hero-canvas');

if (canvas && window.THREE) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x05070b, 10, 36);

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 120);
  camera.position.set(0, 3.2, 12);

  const ambient = new THREE.HemisphereLight(0x9fc2ff, 0x121419, 0.85);
  scene.add(ambient);

  const key = new THREE.SpotLight(0xa8c9ff, 2.4, 52, Math.PI * 0.21, 0.5, 1.1);
  key.position.set(5, 10, 7);
  key.target.position.set(0, 0.7, 0);
  scene.add(key, key.target);

  const rim = new THREE.PointLight(0x7f62ff, 1.8, 34);
  rim.position.set(-7, 4, -4);
  scene.add(rim);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(12, 90),
    new THREE.MeshStandardMaterial({ color: 0x0a0d13, roughness: 0.95, metalness: 0.03 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.15;
  scene.add(floor);

  const portal = new THREE.Group();
  for (let i = 0; i < 5; i += 1) {
    const t = new THREE.Mesh(
      new THREE.TorusGeometry(2 + i * 0.75, 0.015 + i * 0.005, 16, 140),
      new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x79b9ff : 0x8d7aff,
        transparent: true,
        opacity: 0.25 - i * 0.03,
      })
    );
    t.rotation.x = Math.PI / 2;
    t.position.y = -0.8;
    portal.add(t);
  }
  scene.add(portal);

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x727b8a, roughness: 0.86, metalness: 0.04 });
  const clothMat = new THREE.MeshStandardMaterial({ color: 0xcfd3dd, roughness: 0.8, metalness: 0.02 });

  function buildPerson({ x, z, rot, apron }) {
    const root = new THREE.Group();

    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.56, 1.55, 8, 16), bodyMat);
    torso.position.y = 0.1;
    root.add(torso);

    const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 0), bodyMat);
    head.position.y = 1.52;
    root.add(head);

    const armA = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.95, 4, 8), bodyMat);
    armA.position.set(-0.58, 0.45, 0.22);
    armA.rotation.z = 0.55;
    root.add(armA);

    const armB = armA.clone();
    armB.position.x = 0.58;
    armB.rotation.z = -0.65;
    armB.position.z = 0.3;
    root.add(armB);

    if (apron) {
      const bib = new THREE.Mesh(new THREE.BoxGeometry(0.82, 1.2, 0.08), clothMat);
      bib.position.set(0, 0.1, 0.56);
      root.add(bib);
    }

    root.position.set(x, 0, z);
    root.rotation.y = rot;
    return root;
  }

  const seller = buildPerson({ x: -1.35, z: 0.4, rot: 0.28, apron: true });
  const buyer = buildPerson({ x: 1.55, z: 1.05, rot: -2.45, apron: false });
  buyer.scale.set(0.92, 0.92, 0.92);
  scene.add(seller, buyer);

  const phone = new THREE.Mesh(
    new THREE.BoxGeometry(0.34, 0.56, 0.07),
    new THREE.MeshStandardMaterial({
      color: 0xf8fbff,
      emissive: 0x8fc7ff,
      emissiveIntensity: 1.5,
      roughness: 0.26,
      metalness: 0.09,
    })
  );
  phone.position.set(-0.77, 0.43, 1.16);
  phone.rotation.set(-0.32, 0.3, 0.12);
  seller.add(phone);

  const card = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.32, 0.016),
    new THREE.MeshStandardMaterial({ color: 0xd7dce6, roughness: 0.7, metalness: 0.04 })
  );
  card.position.set(0.43, 0.3, 0.92);
  card.rotation.set(-0.42, 0.36, -0.24);
  buyer.add(card);

  const receipt = new THREE.Mesh(
    new THREE.PlaneGeometry(0.35, 0.62),
    new THREE.MeshBasicMaterial({ color: 0xaad8ff, transparent: true, opacity: 0.0, side: THREE.DoubleSide })
  );
  receipt.position.set(0.2, 0.8, 0.5);
  receipt.rotation.y = -0.3;
  buyer.add(receipt);

  const particles = new THREE.Group();
  for (let i = 0; i < 160; i += 1) {
    const p = new THREE.Mesh(
      new THREE.SphereGeometry(0.015 + Math.random() * 0.02, 8, 8),
      new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0x86bbff : 0xa08fff, transparent: true, opacity: 0.38 })
    );
    p.position.set((Math.random() - 0.5) * 18, Math.random() * 6, (Math.random() - 0.5) * 15);
    particles.add(p);
  }
  scene.add(particles);

  const pointer = { x: 0, y: 0 };
  canvas.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    pointer.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  });
  canvas.addEventListener('pointerleave', () => {
    pointer.x = 0;
    pointer.y = 0;
  });

  const getProgress = () => {
    const story = document.getElementById('story');
    if (!story) return 0;
    const r = story.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    if (total <= 0) return 0;
    return Math.min(1, Math.max(0, -r.top / total));
  };

  function resize() {
    const { clientWidth, clientHeight } = canvas;
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
  }

  window.addEventListener('resize', resize);
  resize();

  const clock = new THREE.Clock();

  function animate() {
    const t = clock.getElapsedTime();
    const p = getProgress();

    // Scene loop
    portal.rotation.y = t * 0.22;
    particles.rotation.y += 0.001;

    // Smooth prop motion
    phone.position.y = 0.43 + Math.sin(t * 2.5) * 0.035;
    card.position.y = 0.3 + Math.sin(t * 2.2 + 0.8) * 0.028;

    // Scroll-driven narrative camera
    const camX = THREE.MathUtils.lerp(0, 2.4, p);
    const camY = THREE.MathUtils.lerp(3.2, 2.0, p);
    const camZ = THREE.MathUtils.lerp(12, 6.5, p);

    camera.position.x += ((camX + pointer.x * 0.6) - camera.position.x) * 0.05;
    camera.position.y += ((camY - pointer.y * 0.4) - camera.position.y) * 0.05;
    camera.position.z += (camZ - camera.position.z) * 0.05;

    const lookX = THREE.MathUtils.lerp(0, 0.45, p);
    const lookY = THREE.MathUtils.lerp(0.35, 0.55, p);
    camera.lookAt(lookX, lookY, 0.4);

    // Beat synced lights
    key.position.x = 5 + Math.sin(t * 0.9) * 1.6;
    rim.position.z = -4 + Math.cos(t * 0.7) * 1.8;

    // Payment pulse + receipt reveal through progress
    const pulse = 1 + Math.sin(t * 6) * 0.08;
    phone.scale.setScalar(pulse * (1 + p * 0.05));
    receipt.material.opacity = THREE.MathUtils.smoothstep(p, 0.64, 0.92) * 0.85;
    receipt.position.y = 0.8 + THREE.MathUtils.smoothstep(p, 0.64, 0.92) * 0.25;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
}
