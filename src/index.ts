import {
  World,
  SphereGeometry,
  MeshStandardMaterial,
  Mesh,
  DirectionalLight,
  AmbientLight,
  TextureLoader,
  AudioListener,
  AudioLoader,
  Audio,
} from '@iwsdk/core';
import * as THREE from 'three';

class SoundPool {
  private sounds: Audio[] = [];
  private currentIndex = 0;
  
  constructor(
    audioListener: AudioListener,
    audioLoader: AudioLoader,
    url: string,
    volume: number,
    poolSize: number = 5
  ) {
    for (let i = 0; i < poolSize; i++) {
      audioLoader.load(url, (buffer) => {
        const sound = new Audio(audioListener);
        sound.setBuffer(buffer);
        sound.setVolume(volume);
        this.sounds.push(sound);
      });
    }
  }
  
  play() {
    if (this.sounds.length === 0) return;
    
    const sound = this.sounds[this.currentIndex];
    if (sound.isPlaying) {
      sound.stop();
    }
    sound.play();
    
    this.currentIndex = (this.currentIndex + 1) % this.sounds.length;
  }
}

async function main() {
  const container = document.getElementById('app');
  if (!container) {
    throw new Error('App container not found');
  }

  console.log('Initializing IWSDK World...');

  const world = await World.create(container);
  
  console.log('World created:', world);

  world.camera.position.set(0, 1.6, 2);
  world.camera.lookAt(0, 0, -2);

  const dirLight = new DirectionalLight(0xBADFFF, 5.5);
  dirLight.position.set(0, 0, 9);
  world.scene.add(dirLight);
  console.log('Directional light added');

  const dirLight2 = new DirectionalLight(0xBAD000, 1.5);
  dirLight2.position.set(1, -3, -9);
  world.scene.add(dirLight2);
  
  const dirLight3 = new DirectionalLight(0xBAD000, 1.5);
  dirLight3.position.set(0, 1, -7);
  world.scene.add(dirLight3);

  const ambLight = new AmbientLight(0xBADF0F, 0.001);
  world.scene.add(ambLight);
  console.log('Ambient light added');

  console.log('Loading textures...');
  const textureLoader = new TextureLoader();
  const textures = await Promise.all([
    textureLoader.loadAsync('./textures/normal1.jpg'),
    textureLoader.loadAsync('./textures/normal2.jpg'),
    textureLoader.loadAsync('./textures/normal3.jpg'),
    textureLoader.loadAsync('./textures/normal4.jpg'),
    textureLoader.loadAsync('./textures/normal5.jpg'),
    textureLoader.loadAsync('./textures/normal6.jpg'),
    textureLoader.loadAsync('./textures/normal7.jpg'),
    textureLoader.loadAsync('./textures/normal8.jpg'),
  ]).catch((err) => {
    console.warn('Failed to load some textures:', err);
    return [];
  });
  console.log(`Loaded ${textures.length} textures`);

  console.log('Setting up audio...');
  const audioListener = new AudioListener();
  world.camera.add(audioListener);
  const audioLoader = new AudioLoader();

  const soundPools = [
    new SoundPool(audioListener, audioLoader, './sounds/sound1.mp3', 0.1, 5),
    new SoundPool(audioListener, audioLoader, './sounds/sound2.mp3', 0.1, 5),
    new SoundPool(audioListener, audioLoader, './sounds/sound3.mp3', 0.05, 5),
    new SoundPool(audioListener, audioLoader, './sounds/sound4.mp3', 0.09, 5),
    new SoundPool(audioListener, audioLoader, './sounds/sound5.mp3', 0.2, 5),
  ];
  console.log('Sound pools created');

  const sphereData = [
    { position: [3.3, 1.5, -2], scale: 0.7, color: '#FFBFC3', sound: 4, rotation: [0, 0.6, 0.6] },
    { position: [-2, 1.5, -1.5], scale: 0.7, color: '#E6D62E', sound: 3, rotation: [0, 0, 0.6] },
    { position: [2, 3, -3], scale: 0.7, color: '#BADFFF', sound: 2, rotation: [0, 0, 0.5] },
    { position: [3.1, -2, -2], scale: 0.7, color: '#BADFFF', sound: 1, rotation: [0, 0.6, 0] },
    { position: [0.5, 1, -2.5], scale: 0.7, color: '#EBDCAB', sound: 1, rotation: [0.6, 0, 0] },
    { position: [-3.5, -1.5, -2.5], scale: 0.7, color: '#BADFFF', sound: 0, rotation: [0.2, 0, 0] },
    { position: [1.6, 2, 2.5], scale: 0.7, color: '#BADFFF', sound: 3, rotation: [0, 0, 0.6] },
    { position: [3.9, 0, -1.5], scale: 0.7, color: '#F77B23', sound: 2, rotation: [0, 0, 0.6] },
    { position: [-1.9, 0, -3], scale: 0.7, color: '#F0BB0E', sound: 4, rotation: [0.6, 0.3, 0] },
    { position: [-4, 1, -3.9], scale: 0.7, color: '#F77B23', sound: 1, rotation: [0, 0, 0.6] },
    { position: [2, 0.1, -1.7], scale: 0.7, color: '#E6D62E', sound: 0, rotation: [0.6, 0, 0] },
    { position: [-2.9, -1.0, 1], scale: 0.7, color: '#EBDCAB', sound: 4, rotation: [0, 0, 0.9] },
  ];

  const colors = [
    '#ffb3b3', '#F7E6B2', '#E0A900', '#BA6368',
    '#FFCD69', '#C7FC62', '#E5FFB3', '#BADFFF',
  ];

  const randomItem = (items: any[]) => items[Math.floor(Math.random() * items.length)];

  const sphereMeshes: Mesh[] = [];

  console.log('Creating spheres...');
  sphereData.forEach((data, index) => {
    const geometry = new SphereGeometry(1, 64, 64);
    const material = new MeshStandardMaterial({
      color: data.color,
      normalMap: textures.length > 0 ? randomItem(textures) : undefined,
      roughness: 0.5,
      metalness: 0.5,
      flatShading: false,
    });
    const mesh = new Mesh(geometry, material);
    mesh.geometry.computeVertexNormals();

    mesh.position.set(data.position[0], data.position[1], data.position[2]);
    mesh.scale.set(data.scale, data.scale, data.scale);
    
    mesh.userData = {
      rotationSpeed: data.rotation,
      originalColor: data.color,
      soundIndex: data.sound,
    };

    world.scene.add(mesh);
    sphereMeshes.push(mesh);
  });

  function interactWithSphere(mesh: Mesh) {
    const material = mesh.material as MeshStandardMaterial;
    const soundIndex = mesh.userData.soundIndex;
    
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    material.color.set(randomColor);
    
    if (soundPools[soundIndex]) {
      soundPools[soundIndex].play();
    }
  }

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const lastTouchedTime = new Map<Mesh, number>();
  const TOUCH_COOLDOWN = 200;

  container.addEventListener('click', (event: MouseEvent) => {
    const rect = container.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, world.camera);
    const intersects = raycaster.intersectObjects(sphereMeshes, false);
    
    if (intersects.length > 0) {
      const clickedMesh = intersects[0].object as Mesh;
      interactWithSphere(clickedMesh);
    }
  });

  container.addEventListener('mousemove', (event: MouseEvent) => {
    const rect = container.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, world.camera);
    const intersects = raycaster.intersectObjects(sphereMeshes, false);
    
    container.style.cursor = intersects.length > 0 ? 'pointer' : 'auto';
  });

  let lastTime = performance.now();
  
  function animate() {
    requestAnimationFrame(animate);
    
    const currentTime = performance.now();
    const delta = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    sphereMeshes.forEach((mesh) => {
      const [rx, ry, rz] = mesh.userData.rotationSpeed;
      mesh.rotation.x += delta * rx;
      mesh.rotation.y += delta * ry;
      mesh.rotation.z += delta * rz;
    });

    if (world.xr && world.xr.isPresenting) {
      const session = world.xr.getSession();
      if (session) {
        const frame = world.xr.getFrame();
        if (frame) {
          const inputSources = session.inputSources;
          
          for (const inputSource of inputSources) {
            if (inputSource.gripSpace) {
              const pose = frame.getPose(inputSource.gripSpace, world.xr.getReferenceSpace());
              
              if (pose) {
                const handPosition = new THREE.Vector3(
                  pose.transform.position.x,
                  pose.transform.position.y,
                  pose.transform.position.z
                );
                
                sphereMeshes.forEach((mesh) => {
                  const distance = handPosition.distanceTo(mesh.position);
                  const sphereRadius = mesh.scale.x;
                  const handRadius = 0.1;
                  
                  if (distance < (sphereRadius + handRadius)) {
                    const lastTime = lastTouchedTime.get(mesh) || 0;
                    if (currentTime - lastTime > TOUCH_COOLDOWN) {
                      interactWithSphere(mesh);
                      lastTouchedTime.set(mesh, currentTime);
                    }
                  }
                });
              }
            }
          }
        }
      }
    }
  }

  animate();
}

main().catch((error) => {
  console.error('Failed to initialize app:', error);
});