import {
  Points,
  ShaderMaterial,
  Uniform,
  Object3D,
  DataTexture,
  BufferGeometry,
  BufferAttribute,
} from "three";
import fragmentShader from "@/shader/pointcloud.frag.glsl";
import vertexShader from "@/shader/pointcloud.vert.glsl";
import { settings } from "@/ts/settings";

export default class PointCloud extends Object3D {
  geometry!: BufferGeometry;
  material: ShaderMaterial;
  mesh: Points;
  positions!: DataTexture;

  dtw = settings.dataTexture.width;
  dth = settings.dataTexture.height;
  dts = this.dtw * this.dth;

  constructor() {
    super();

    this.initGeometry();

    this.material = new ShaderMaterial({
      uniforms: {
        // Texture is gonna be updated from sketch render loop after simulation render target swap
        uTexture: new Uniform(undefined),
      },
      fragmentShader: fragmentShader,
      vertexShader: vertexShader,
      depthTest: false,
      transparent: true,
    });

    this.mesh = new Points(this.geometry, this.material);

    this.add(this.mesh);
  }

  /**
   * Initialize barebone buffer geometry with attributes.
   * Vertices count is defined by the size of the data texture.
   */
  initGeometry() {
    this.geometry = new BufferGeometry();

    const positions = new Float32Array(this.dts * 3);
    const uv = new Float32Array(this.dts * 2);

    for (let y = 0; y < this.dth; y++) {
      for (let x = 0; x < this.dtw; x++) {
        const index = x + this.dtw * y;

        // Initial value of positions component does not matter,
        // they are gonna be overwritten in vertex shader using values from position data texture
        positions[3 * index + 0] = 0;
        positions[3 * index + 1] = 0;
        positions[3 * index + 2] = 0;

        uv[2 * index + 0] = x / (this.dtw - 1);
        uv[2 * index + 1] = y / (this.dth - 1);
      }
    }

    this.geometry.setAttribute("position", new BufferAttribute(positions, 3));
    this.geometry.setAttribute("uv", new BufferAttribute(uv, 2));
  }
}
