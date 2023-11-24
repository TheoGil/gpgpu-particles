const settings = {
  camera: {
    fov: 70,
    near: 0.1,
    far: 1000,
    position: {
      x: 0,
      y: 0,
      z: 1,
    },
  },
  dataTexture: {
    width: 256,
    height: 256,
  },
  simulation: {
    noise: {
      amplitude: 0,
      frequency: 0.5,
      speed: 0.5,
    },
    progress: 0,
    maxSpeed: 0.05,
    pointerRepelAreaRadius: 0.25,
    pointerRepelAreaPow: 5,
    pointerRepelStrength: 0.000001,
  },
};

export { settings };
