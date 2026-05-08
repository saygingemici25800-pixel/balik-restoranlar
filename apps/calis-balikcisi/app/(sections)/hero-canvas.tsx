'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const lerp = (a: number, b: number, t: number) =>
  a + (b - a) * Math.max(0, Math.min(1, t));

const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

export function HeroCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    let scrollProgress = 0;
    const updateScroll = () => {
      const max =
        document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress =
        max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
    };
    updateScroll();

    const scene = new THREE.Scene();

    const sunsetBg = new THREE.Color(0x1a0a2e);
    const underwaterBg = new THREE.Color(0x062a3d);
    scene.background = sunsetBg.clone();

    const linearFog = new THREE.Fog(0x3d1208, 30, 115);
    const expFog = new THREE.FogExp2(0x0a3d5c, 0);
    scene.fog = linearFog;

    const ambientLight = new THREE.AmbientLight(0xff8866, 0.6);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xff6000, 0x1a0508, 0.8);
    scene.add(hemiLight);

    const sunPointLight = new THREE.PointLight(0xffaa00, 2, 500);
    sunPointLight.position.set(8, 4.2, -65);
    scene.add(sunPointLight);

    const coolAmbient = new THREE.AmbientLight(0x4488aa, 0);
    scene.add(coolAmbient);

    const underwaterPoint = new THREE.PointLight(0x00aacc, 0, 60);
    underwaterPoint.position.set(0, -3, 0);
    scene.add(underwaterPoint);

    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      300,
    );
    camera.position.set(0, 4, 18);
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x1a0a2e, 1);
    container.appendChild(renderer.domElement);

    const skyGeo = new THREE.PlaneGeometry(500, 220);
    const skyMat = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x1a0a2e) },
        midColor: { value: new THREE.Color(0x6b1a00) },
        horizonColor: { value: new THREE.Color(0xe84800) },
        sunGlowColor: { value: new THREE.Color(0xff8c00) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 midColor;
        uniform vec3 horizonColor;
        uniform vec3 sunGlowColor;
        varying vec2 vUv;
        void main() {
          float t = vUv.y;
          vec3 col;
          if (t < 0.15) {
            col = mix(sunGlowColor, horizonColor, smoothstep(0.0, 0.15, t));
          } else if (t < 0.45) {
            col = mix(horizonColor, midColor, smoothstep(0.15, 0.45, t));
          } else {
            col = mix(midColor, topColor, smoothstep(0.45, 0.9, t));
          }
          gl_FragColor = vec4(col, 1.0);
        }
      `,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    sky.position.set(0, 35, -110);
    scene.add(sky);

    const sunGeo = new THREE.CircleGeometry(10, 64);
    const sunMat = new THREE.ShaderMaterial({
      uniforms: {
        innerColor: { value: new THREE.Color(0xfff5cc) },
        midColor: { value: new THREE.Color(0xffcc44) },
        haloColor: { value: new THREE.Color(0xff6000) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv - 0.5;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 innerColor;
        uniform vec3 midColor;
        uniform vec3 haloColor;
        varying vec2 vUv;
        void main() {
          float d = length(vUv);
          float core = smoothstep(0.12, 0.0, d);
          float gold = smoothstep(0.32, 0.05, d);
          float outer = smoothstep(0.5, 0.15, d);
          vec3 col = haloColor;
          col = mix(col, midColor, gold);
          col = mix(col, innerColor, core);
          float alpha = max(core, gold * 0.85);
          alpha = max(alpha, outer * 0.6);
          gl_FragColor = vec4(col, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
    });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.position.set(8, 4.2, -65);
    scene.add(sun);

    const seaSegments = isMobile ? 60 : 140;
    const seaGeo = new THREE.PlaneGeometry(220, 220, seaSegments, seaSegments);
    seaGeo.rotateX(-Math.PI / 2);

    const seaMat = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        deepColor: { value: new THREE.Color(0x1a0810) },
        shallowColor: { value: new THREE.Color(0x2d0a0a) },
        foamColor: { value: new THREE.Color(0xff8c00) },
        sunColor: { value: new THREE.Color(0xcc3300) },
        fogColor: { value: new THREE.Color(0x3d1208) },
        fogNear: { value: 30.0 },
        fogFar: { value: 115.0 },
      },
      vertexShader: `
        uniform float time;
        varying vec3 vWorldPos;
        varying float vWaveHeight;

        float wave(vec2 p, vec2 dir, float freq, float amp, float speed) {
          return sin(dot(p, dir) * freq + time * speed) * amp;
        }

        void main() {
          vec3 pos = position;
          float h = 0.0;
          h += wave(pos.xz, vec2(1.0, 0.4), 0.18, 0.55, 0.55);
          h += wave(pos.xz, vec2(-0.6, 1.0), 0.26, 0.32, 0.85);
          h += wave(pos.xz, vec2(0.7, -0.3), 0.42, 0.16, 1.15);
          pos.y += h;
          vWaveHeight = h;
          vec4 worldPos = modelMatrix * vec4(pos, 1.0);
          vWorldPos = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 deepColor;
        uniform vec3 shallowColor;
        uniform vec3 foamColor;
        uniform vec3 sunColor;
        uniform vec3 fogColor;
        uniform float fogNear;
        uniform float fogFar;
        varying vec3 vWorldPos;
        varying float vWaveHeight;

        void main() {
          float depth = smoothstep(-0.6, 0.85, vWaveHeight);
          vec3 col = mix(deepColor, shallowColor, depth);

          float foam = smoothstep(0.55, 0.82, vWaveHeight);
          col = mix(col, foamColor, foam * 0.25);

          float horizonReflect = smoothstep(0.0, -55.0, vWorldPos.z) *
            smoothstep(8.0, 0.0, abs(vWorldPos.x - 8.0));
          col = mix(col, sunColor, horizonReflect * 0.4);

          col += vec3(0.045, 0.018, 0.005);

          float dist = length(vWorldPos - cameraPosition);
          float fogFactor = smoothstep(fogNear, fogFar, dist);
          col = mix(col, fogColor, fogFactor);

          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
    const sea = new THREE.Mesh(seaGeo, seaMat);
    scene.add(sea);

    const seaTimeUniform = seaMat.uniforms.time as { value: number };

    const ceilingGeo = new THREE.PlaneGeometry(200, 200);
    ceilingGeo.rotateX(-Math.PI / 2);
    const ceilingMat = new THREE.MeshPhongMaterial({
      color: 0x1a6b8a,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      shininess: 30,
      depthWrite: false,
    });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.position.y = -0.05;
    scene.add(ceiling);

    const boats: THREE.Group[] = [];
    if (!isMobile) {
      for (let i = 0; i < 2; i++) {
        const boat = new THREE.Group();

        const hullGeo = new THREE.BoxGeometry(1.4, 0.3, 0.5);
        const hullMat = new THREE.MeshLambertMaterial({ color: 0x0d0508 });
        const hull = new THREE.Mesh(hullGeo, hullMat);
        boat.add(hull);

        const cabinGeo = new THREE.BoxGeometry(0.5, 0.25, 0.35);
        const cabinMat = new THREE.MeshLambertMaterial({ color: 0x0d0508 });
        const cabin = new THREE.Mesh(cabinGeo, cabinMat);
        cabin.position.set(-0.1, 0.25, 0);
        boat.add(cabin);

        const mastGeo = new THREE.BoxGeometry(0.04, 0.7, 0.04);
        const mast = new THREE.Mesh(mastGeo, cabinMat);
        mast.position.y = 0.55;
        boat.add(mast);

        boat.userData.phase = (i / 2) * Math.PI * 2 + Math.random() * 0.4;
        boat.userData.radius = 28 + i * 8;
        boat.userData.zOffset = -52 - i * 4;
        scene.add(boat);
        boats.push(boat);
      }
    }

    type GullData = {
      mesh: THREE.Mesh;
      phase: number;
      speed: number;
      scaleX: number;
      scaleY: number;
      baseY: number;
      baseZ: number;
    };
    const gulls: GullData[] = [];
    if (!isMobile) {
      const gullCount = 4;
      const gullShape = new THREE.Shape();
      gullShape.moveTo(-0.5, 0);
      gullShape.quadraticCurveTo(-0.25, 0.16, 0, 0.02);
      gullShape.quadraticCurveTo(0.25, 0.16, 0.5, 0);
      gullShape.quadraticCurveTo(0.25, -0.04, 0, 0.0);
      gullShape.quadraticCurveTo(-0.25, -0.04, -0.5, 0);
      const gullGeo = new THREE.ShapeGeometry(gullShape);

      for (let i = 0; i < gullCount; i++) {
        const gullMat = new THREE.MeshBasicMaterial({
          color: 0x0d0508,
          transparent: true,
          opacity: 0.85,
          side: THREE.DoubleSide,
        });
        const gull = new THREE.Mesh(gullGeo, gullMat);
        scene.add(gull);
        gulls.push({
          mesh: gull,
          phase: Math.random() * Math.PI * 2,
          speed: 0.18 + Math.random() * 0.18,
          scaleX: 9 + Math.random() * 6,
          scaleY: 1.6 + Math.random() * 1.2,
          baseY: 6.5 + Math.random() * 3.5,
          baseZ: -22 - Math.random() * 8,
        });
      }
    }

    const godRays: THREE.Mesh[] = [];
    let godRayGeo: THREE.ConeGeometry | null = null;
    if (!isMobile) {
      godRayGeo = new THREE.ConeGeometry(0.55, 16, 6, 1, true);
      for (let i = 0; i < 4; i++) {
        const rayMat = new THREE.MeshBasicMaterial({
          color: 0x9fd4e8,
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const ray = new THREE.Mesh(godRayGeo, rayMat);
        ray.position.set((i - 1.5) * 3.5, -7, -3 - i);
        scene.add(ray);
        godRays.push(ray);
      }
    }

    type SpriteFish = {
      sprite: THREE.Sprite;
      texture: THREE.CanvasTexture;
      material: THREE.SpriteMaterial;
    };
    const fishList: SpriteFish[] = [];

    const createFishTexture = (
      color1: string,
      color2: string,
    ): THREE.CanvasTexture | null => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.save();

      // BODY — vertical gradient (dark top → bright mid → dark bottom)
      const bodyGrad = ctx.createLinearGradient(40, 30, 40, 90);
      bodyGrad.addColorStop(0, color1);
      bodyGrad.addColorStop(0.4, color2);
      bodyGrad.addColorStop(1, color1);
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(95, 64, 70, 28, 0, 0, Math.PI * 2);
      ctx.fill();

      // BELLY — pale underside
      ctx.fillStyle = 'rgba(220,230,240,0.6)';
      ctx.beginPath();
      ctx.ellipse(100, 74, 55, 14, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // TAIL — fan shape
      ctx.fillStyle = color1;
      ctx.beginPath();
      ctx.moveTo(162, 64);
      ctx.lineTo(195, 38);
      ctx.lineTo(190, 64);
      ctx.lineTo(195, 90);
      ctx.closePath();
      ctx.fill();

      // DORSAL FIN
      ctx.fillStyle = 'rgba(100,140,180,0.8)';
      ctx.beginPath();
      ctx.moveTo(70, 38);
      ctx.quadraticCurveTo(95, 18, 130, 38);
      ctx.lineTo(70, 38);
      ctx.fill();

      // LATERAL LINE
      ctx.strokeStyle = 'rgba(180,210,230,0.9)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(45, 60);
      ctx.quadraticCurveTo(100, 56, 160, 62);
      ctx.stroke();

      // SCALE PATTERN — subtle arcs
      ctx.strokeStyle = 'rgba(100,140,170,0.25)';
      ctx.lineWidth = 0.8;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.arc(60 + i * 18, 64, 12, -0.7, 0.7);
        ctx.stroke();
      }

      // HEAD — darker overlay
      ctx.fillStyle = 'rgba(50,80,110,0.3)';
      ctx.beginPath();
      ctx.ellipse(42, 64, 22, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      // GILL LINE
      ctx.strokeStyle = 'rgba(60,90,120,0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(52, 64, 16, -0.6, 0.6);
      ctx.stroke();

      // EYE
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(36, 58, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111122';
      ctx.beginPath();
      ctx.arc(35, 58, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath();
      ctx.arc(33, 56, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // MOUTH
      ctx.strokeStyle = 'rgba(40,70,100,0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(18, 66);
      ctx.quadraticCurveTo(22, 70, 28, 66);
      ctx.stroke();

      ctx.restore();

      return new THREE.CanvasTexture(canvas);
    };

    const buildSpriteFish = (
      color1: string,
      color2: string,
      scaleX: number,
      scaleY: number,
      pos: [number, number, number],
    ): SpriteFish | null => {
      const texture = createFishTexture(color1, color2);
      if (!texture) return null;
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
      });
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(scaleX, scaleY, 1);
      sprite.position.set(pos[0], pos[1], pos[2]);
      scene.add(sprite);
      return { sprite, texture, material };
    };

    if (!isMobile) {
      const f1 = buildSpriteFish('#4a7a9b', '#8ab8d8', 1.4, 0.7, [-3, -3, -5]);
      if (f1) fishList.push(f1);
      const f2 = buildSpriteFish('#3d6b8a', '#7aaac5', 1.1, 0.55, [2, -4.5, -7]);
      if (f2) fishList.push(f2);
      const f3 = buildSpriteFish('#527d9e', '#90bcd5', 0.9, 0.45, [0.5, -2.5, -4]);
      if (f3) fishList.push(f3);
    }

    const handleResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    handleResize();

    let resizeObs: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObs = new ResizeObserver(handleResize);
      resizeObs.observe(container);
    } else {
      window.addEventListener('resize', handleResize);
    }

    const clock = new THREE.Clock();
    let rafId = 0;

    const applyScroll = (elapsed: number) => {
      const t = scrollProgress;

      const cameraY =
        t <= 0.5
          ? lerp(4, 0, t / 0.5)
          : lerp(0, -8, (t - 0.5) / 0.5);
      const cameraZ = lerp(18, 5, t);
      camera.position.y =
        cameraY + (prefersReducedMotion ? 0 : Math.sin(elapsed * 0.785) * 0.18);
      camera.position.x = prefersReducedMotion
        ? 0
        : Math.sin(elapsed * 0.18) * 0.4;
      camera.position.z = cameraZ;

      const lookY = lerp(2, -3, smoothstep(0.4, 0.7, t));
      camera.lookAt(0, lookY, 0);

      (scene.background as THREE.Color)
        .copy(sunsetBg)
        .lerp(underwaterBg, smoothstep(0.4, 0.85, t));

      if (t > 0.5) {
        scene.fog = expFog;
        expFog.density = lerp(0, 0.035, smoothstep(0.5, 0.85, t));
      } else {
        scene.fog = linearFog;
      }

      const dim = smoothstep(0.4, 0.85, t);
      ambientLight.intensity = lerp(0.6, 0.15, dim);
      hemiLight.intensity = lerp(0.8, 0.05, dim);
      sunPointLight.intensity = lerp(2, 0, smoothstep(0.4, 0.7, t));
      coolAmbient.intensity = lerp(0, 0.5, smoothstep(0.5, 0.85, t));
      underwaterPoint.intensity = lerp(0, 1.4, smoothstep(0.5, 0.85, t));

      const aboveVisible = t < 0.6;
      boats.forEach((b) => {
        b.visible = aboveVisible;
      });
      gulls.forEach((g) => {
        g.mesh.visible = aboveVisible;
      });
      sun.visible = t < 0.55;

      ceilingMat.opacity = lerp(0, 0.85, smoothstep(0.4, 0.7, t));

      const fishOpacity = smoothstep(0.45, 0.85, t);
      fishList.forEach((f) => {
        f.material.opacity = fishOpacity;
      });

      godRays.forEach((ray) => {
        const m = ray.material as THREE.MeshBasicMaterial;
        m.opacity = lerp(0, 0.18, smoothstep(0.5, 0.85, t));
      });
    };

    const tick = () => {
      const elapsed = clock.getElapsedTime();
      seaTimeUniform.value = elapsed;

      boats.forEach((boat, i) => {
        const tt = elapsed * 0.0105 + boat.userData.phase;
        boat.position.x = Math.cos(tt) * boat.userData.radius - 4 * i;
        boat.position.z = boat.userData.zOffset + Math.sin(tt) * 6;
        boat.position.y = 0.45 + Math.sin(elapsed * 0.7 + i) * 0.08;
        boat.rotation.y = -tt + Math.PI / 2;
        boat.rotation.z = Math.sin(elapsed * 0.9 + i) * 0.04;
      });

      gulls.forEach((g) => {
        const tt = elapsed * g.speed + g.phase;
        g.mesh.position.x = Math.sin(tt) * g.scaleX;
        g.mesh.position.y = g.baseY + Math.sin(tt * 2.0) * g.scaleY;
        g.mesh.position.z = g.baseZ + Math.cos(tt) * 4;
        const flap = 0.7 + Math.sin(elapsed * 7 + g.phase) * 0.3;
        g.mesh.scale.set(1, flap, 1);
      });

      fishList.forEach((f, i) => {
        if (i === 0) {
          f.sprite.position.x = -3 + Math.sin(elapsed * 0.35) * 2.5;
          f.sprite.position.y = -3 + Math.cos(elapsed * 0.28) * 0.5;
          f.material.rotation =
            Math.sin(elapsed * 0.35) > 0 ? 0 : Math.PI;
        } else if (i === 1) {
          f.sprite.position.x = 2 + Math.sin(elapsed * 0.42 + 1.5) * 2;
          f.sprite.position.y = -4.5 + Math.cos(elapsed * 0.3 + 2) * 0.4;
          f.material.rotation =
            Math.sin(elapsed * 0.42 + 1.5) > 0 ? 0 : Math.PI;
        } else {
          f.sprite.position.x = 0.5 + Math.sin(elapsed * 0.5 + 3) * 1.5;
          f.sprite.position.y = -2.5 + Math.cos(elapsed * 0.38) * 0.3;
          f.material.rotation =
            Math.sin(elapsed * 0.5 + 3) > 0 ? 0 : Math.PI;
        }
      });

      godRays.forEach((ray, i) => {
        ray.position.x = (i - 1.5) * 3.5 + Math.sin(elapsed * 0.3 + i) * 0.4;
        ray.rotation.x = Math.sin(elapsed * 0.4 + i) * 0.03;
      });

      applyScroll(elapsed);

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    };

    const renderStatic = () => {
      applyScroll(0);
      renderer.render(scene, camera);
    };

    const onScroll = () => {
      updateScroll();
      if (prefersReducedMotion) {
        renderStatic();
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    if (prefersReducedMotion) {
      renderStatic();
    } else {
      rafId = requestAnimationFrame(tick);
    }

    const handleVisibility = () => {
      if (document.hidden) {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = 0;
        }
      } else if (!prefersReducedMotion && !rafId) {
        clock.getDelta();
        rafId = requestAnimationFrame(tick);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('scroll', onScroll);
      if (resizeObs) resizeObs.disconnect();
      else window.removeEventListener('resize', handleResize);

      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }

      const disposeMesh = (m: THREE.Mesh) => {
        m.geometry.dispose();
        const mat = m.material as THREE.Material | THREE.Material[];
        if (Array.isArray(mat)) mat.forEach((mm) => mm.dispose());
        else mat.dispose();
      };

      seaGeo.dispose();
      seaMat.dispose();
      skyGeo.dispose();
      skyMat.dispose();
      sunGeo.dispose();
      sunMat.dispose();
      ceilingGeo.dispose();
      ceilingMat.dispose();

      boats.forEach((b) => {
        b.children.forEach((c) => {
          if (c instanceof THREE.Mesh) disposeMesh(c);
        });
      });
      gulls.forEach((g) => disposeMesh(g.mesh));
      if (godRayGeo) godRayGeo.dispose();
      godRays.forEach((r) => {
        const mat = r.material as THREE.Material | THREE.Material[];
        if (Array.isArray(mat)) mat.forEach((mm) => mm.dispose());
        else mat.dispose();
      });

      fishList.forEach((f) => {
        f.material.dispose();
        f.texture.dispose();
      });

      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none"
      data-hero-canvas=""
      aria-hidden="true"
    />
  );
}
