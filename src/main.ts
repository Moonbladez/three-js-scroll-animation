import { GUI } from "lil-gui";
import * as THREE from "three";

THREE.ColorManagement.enabled = false;

/**
 * Debug
 */
const gui = new GUI();
const textureLoader = new THREE.TextureLoader();
const objectsDistance = 4;
const particlesFolder = gui.addFolder("Particles").close();
const lightFolder = gui.addFolder("Light").close();
const materialFolder = gui.addFolder("Material").close();

const parameters = {
  materialColor: "#ff80f4",
  particlesCount: 500,
};
materialFolder.addColor(parameters, "materialColor").onChange(() => {
  const { materialColor } = parameters;
  material.color.set(materialColor);
  particlesMaterial.color.set(materialColor);
});
/**
 * Base
 */
// Canvas
const canvas = document.getElementById("canvas") as HTMLCanvasElement;

// Scene
const scene = new THREE.Scene();

/**
 * Objects
 */
// texture
const gradientTexture = textureLoader.load("/textures/gradients/5.jpg");
const particalTexture = textureLoader.load("/textures/particles/10.png");
gradientTexture.magFilter = THREE.NearestFilter;

const material = new THREE.MeshToonMaterial({ color: parameters.materialColor, gradientMap: gradientTexture });
const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 60), material);

const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), material);

const mesh3 = new THREE.Mesh(new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16), material);

mesh1.position.y = -objectsDistance * 0;
mesh2.position.y = -objectsDistance * 1;
mesh3.position.y = -objectsDistance * 2;

mesh1.position.x = 1;
mesh2.position.x = 0;
mesh3.position.x = -1;

scene.add(mesh1, mesh2, mesh3);

const sectionMeshes = [mesh1, mesh2, mesh3];

/**
 * Particles
 */
// Geometry
const positions = new Float32Array(parameters.particlesCount * 3);

for (let i = 0; i < parameters.particlesCount; i++) {
  positions[i * 3 + 0] = Math.random();
  positions[i * 3 + 1] = Math.random();
  positions[i * 3 + 2] = Math.random();
}

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

// Material
const particlesMaterial = new THREE.PointsMaterial({
  alphaMap: particalTexture,
  color: parameters.materialColor,
  sizeAttenuation: true,
  size: 0.2,
  transparent: true,
  alphaTest: 0.001,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);

for (let i = 0; i < parameters.particlesCount; i++) {
  positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
  positions[i * 3 + 1] = objectsDistance * 0.5 - Math.random() * objectsDistance * sectionMeshes.length;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
}
particlesFolder
  .add(parameters, "particlesCount")
  .min(100)
  .max(1000)
  .step(10)
  .onChange(() => {
    const { particlesCount } = parameters;
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = objectsDistance * 0.5 - Math.random() * objectsDistance * sectionMeshes.length;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  });
scene.add(particles);

/**
 * Light
 */

const directionalLight = new THREE.DirectionalLight("#ffffff", 1);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);
lightFolder.add(directionalLight.position, "x").min(-5).max(5).step(0.01);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 6;
cameraGroup.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Scroll
 */
let scrollY: number = window.scrollY;
window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
});

/**
 * cursor
 */

const cursor = {
  x: 0,
  y: 0,
};

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
});

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime: number = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  //update camera
  camera.position.y = (-scrollY / sizes.height) * objectsDistance;

  const parallaxX: number = cursor.x;
  const parallaxY: number = -cursor.y;
  cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * deltaTime;
  cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * deltaTime;

  //animate meshes
  sectionMeshes.forEach((mesh) => {
    mesh.rotation.x = elapsedTime * 0.1;
    mesh.rotation.y = elapsedTime * 0.12;
  });

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
