import {
  OrthographicCamera,
  Scene,
  Vector3,
  PlaneGeometry,
  ShaderMaterial,
  Mesh,
  Uniform,
  DataTexture,
  WebGLRenderTarget,
  NearestFilter,
  FloatType,
  RGBAFormat,
  WebGLRenderer,
  MeshBasicMaterial,
} from "three";
import fragmentShader from "@/shader/simulation.frag.glsl";
import vertexShader from "@/shader/simulation.vert.glsl";
import { emitter, pane } from "@/ts/utils";
import { settings } from "@/ts/settings";

export default class Simulation {
  camera: OrthographicCamera;
  scene: Scene;
  mesh: Mesh;
  positionsDataTexture1: DataTexture;
  positionsDataTexture2: DataTexture;
  geometry: PlaneGeometry;
  material: ShaderMaterial;
  renderTargetA: WebGLRenderTarget;
  renderTargetB: WebGLRenderTarget;
  renderer: WebGLRenderer;
  debugMesh!: Mesh;

  constructor({
    positions1,
    positions2,
    renderer,
  }: {
    positions1: DataTexture;
    positions2: DataTexture;
    renderer: WebGLRenderer;
  }) {
    this.onRender = this.onRender.bind(this);

    this.positionsDataTexture1 = positions1;
    this.positionsDataTexture2 = positions2;
    this.renderer = renderer;

    this.scene = new Scene();

    this.camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.camera.position.z = 1;
    this.camera.lookAt(new Vector3(0, 0, 0));

    this.geometry = new PlaneGeometry(2, 2);
    this.material = new ShaderMaterial({
      fragmentShader,
      vertexShader,
      uniforms: {
        uTime: new Uniform(0),

        uCurrentPosition: new Uniform(this.positionsDataTexture1),

        uOriginalPosition1: new Uniform(this.positionsDataTexture1),
        uOriginalPosition2: new Uniform(this.positionsDataTexture2),

        uMousePosition: new Uniform(new Vector3()),

        uProgress: new Uniform(settings.simulation.progress),
        uMaxSpeed: new Uniform(settings.simulation.maxSpeed),
        uPointerRepelAreaRadius: new Uniform(
          settings.simulation.pointerRepelAreaRadius
        ),
        uPointerRepelAreaPow: new Uniform(
          settings.simulation.pointerRepelAreaPow
        ),
        uPointerRepelStrength: new Uniform(
          settings.simulation.pointerRepelStrength
        ),

        uNoiseAmp: new Uniform(settings.simulation.noise.amplitude),
        uNoiseFreq: new Uniform(settings.simulation.noise.frequency),
      },
    });

    this.mesh = new Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);

    this.renderTargetA = new WebGLRenderTarget(
      settings.dataTexture.width,
      settings.dataTexture.height,
      {
        minFilter: NearestFilter,
        magFilter: NearestFilter,
        format: RGBAFormat,
        type: FloatType,
      }
    );

    this.renderTargetB = this.renderTargetA.clone();

    emitter.on("render", this.onRender);

    this.initDebugMesh();

    const folder = pane.addFolder({
      title: "Simulation",
    });

    folder.addBinding(this.material.uniforms.uProgress, "value", {
      min: 0,
      max: 1,
      label: "Progress",
    });

    const returnFolder = pane.addFolder({
      title: "Return",
    });

    returnFolder.addBinding(this.material.uniforms.uMaxSpeed, "value", {
      min: 0,
      max: 1,
      step: 0.0001,
      label: "Max speed",
    });

    const pointerFolder = folder.addFolder({
      title: "Pointer",
    });

    pointerFolder.addBinding(
      this.material.uniforms.uPointerRepelAreaRadius,
      "value",
      {
        min: 0,
        max: 1,
        step: 0.001,
        label: "Radius",
      }
    );

    pointerFolder.addBinding(
      this.material.uniforms.uPointerRepelAreaPow,
      "value",
      {
        min: 0,
        max: 10,
        step: 0.001,
        label: "Smooth",
      }
    );

    pointerFolder.addBinding(
      this.material.uniforms.uPointerRepelStrength,
      "value",
      {
        min: 0,
        max: 1,
        step: 0.001,
        label: "Strength",
      }
    );

    // folder.addBinding(this.material.uniforms.uNoiseAmp, "value", {
    //   min: 0,
    //   max: 0.001,
    //   step: 0.0001,
    //   label: "Noise amp",
    // });

    // folder.addBinding(this.material.uniforms.uNoiseFreq, "value", {
    //   min: 0,
    //   max: 1,
    //   step: 0.0001,
    //   label: "Noise freq",
    // });

    // folder.addBinding(settings.simulation.noise, "speed", {
    //   min: 0,
    //   max: 1,
    //   step: 0.0001,
    //   label: "Noise speed",
    // });
  }

  initDebugMesh() {
    const debugGeometry = new PlaneGeometry();

    const debugMaterial = new MeshBasicMaterial({
      map: this.renderTargetA.texture,
      depthTest: false,
    });

    this.debugMesh = new Mesh(debugGeometry, debugMaterial);
    this.debugMesh.position.z = -1;
  }

  onRender({ elapsedTime }: { elapsedTime: number }) {
    this.material.uniforms.uTime.value = elapsedTime;

    // Run simulation -> renders simulation output to render target
    this.renderer.setRenderTarget(this.renderTargetA);
    this.renderer.render(this.scene, this.camera);

    // Swap render targets
    const tmp = this.renderTargetA;
    this.renderTargetA = this.renderTargetB;
    this.renderTargetB = tmp;
    this.material.uniforms.uCurrentPosition.value = this.renderTargetB.texture;

    this.renderer.setRenderTarget(null);
  }
}
