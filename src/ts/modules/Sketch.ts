import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { PerspectiveCamera, Scene, WebGLRenderer, Clock } from "three";
import { getPixelDataFromImage } from "@/ts/utils";
import { settings } from "../settings";
import PointCloud from "./PointCloud";
import Simulation from "./Simulation";
import { emitter } from "@/ts/utils";
import t1 from "@/img/logo.png?url";
import t3 from "@/img/epic.png?url";
import Raycaster from "./Raycaster";
import Stats from "stats-js";

export default class Sketch {
  container: HTMLElement;
  scene = new Scene();
  clock = new Clock();
  renderer!: WebGLRenderer;
  camera!: PerspectiveCamera;
  orbitControls!: OrbitControls;
  pointcloud: PointCloud;
  width = 0;
  height = 0;
  time = 0;
  simulation: Simulation;
  raycaster: Raycaster;
  stats = new Stats();

  constructor(options: { dom: HTMLElement }) {
    this.render = this.render.bind(this);
    this.resize = this.resize.bind(this);

    this.container = options.dom;

    document.body.appendChild(this.stats.dom);

    this.scene = new Scene();
    this.initRenderer();
    this.initCamera();

    window.addEventListener("resize", this.resize);

    this.init();
  }

  async init() {
    // Add actors here
    Promise.all([
      getPixelDataFromImage({
        src: t3,
        resolution: 1,
        dataTextureWidth: settings.dataTexture.width,
        dataTextureHeight: settings.dataTexture.height,
      }),
      getPixelDataFromImage({
        src: t1,
        resolution: 1,
        dataTextureWidth: settings.dataTexture.width,
        dataTextureHeight: settings.dataTexture.height,
      }),
    ]).then((dataTextures) => {
      const positionDataTexture1 = dataTextures[0];
      const positionDataTexture2 = dataTextures[1];

      this.pointcloud = new PointCloud();
      this.scene.add(this.pointcloud);

      this.simulation = new Simulation({
        positions1: positionDataTexture1,
        positions2: positionDataTexture2,
        renderer: this.renderer,
      });

      // this.camera.add(this.simulation.debugMesh);

      this.raycaster = new Raycaster({
        camera: this.camera,
      });

      this.render();
    });
  }

  initRenderer() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    this.renderer = new WebGLRenderer({
      alpha: true,
    });
    this.renderer.setSize(this.width, this.height);
    this.container.appendChild(this.renderer.domElement);

    this.renderer.setClearColor(0x222222);
  }

  initCamera() {
    this.camera = new PerspectiveCamera(
      settings.camera.fov,
      this.width / this.height,
      settings.camera.near,
      settings.camera.far
    );

    this.camera.position.set(
      settings.camera.position.x,
      settings.camera.position.y,
      settings.camera.position.z
    );

    this.scene.add(this.camera);

    this.orbitControls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this.orbitControls.enableDamping = true;
    this.orbitControls.enabled = true;
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    this.renderer.setSize(this.width, this.height);

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    emitter.emit("resize", { width: this.width, height: this.height });
  }

  render() {
    this.stats.begin();

    const elapsedTime = this.clock.getElapsedTime();
    const deltaTime = this.clock.getDelta();

    this.time = elapsedTime;

    this.simulation.material.uniforms.uMousePosition.value.copy(
      this.raycaster.intersection
    );

    emitter.emit("render", { deltaTime, elapsedTime });

    // Use simulation output as source for the pointcloud positions texture
    this.pointcloud.material.uniforms.uTexture.value =
      this.simulation.renderTargetA.texture;

    this.orbitControls.update(deltaTime);

    // Render final scene
    this.renderer.render(this.scene, this.camera);

    this.stats.end();

    window.requestAnimationFrame(this.render);
  }
}
