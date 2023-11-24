import {
  Raycaster as ThreeRaycaster,
  Vector2,
  Vector3,
  PerspectiveCamera,
  PlaneGeometry,
  MeshBasicMaterial,
  Mesh,
} from "three";
import { emitter } from "@/ts/utils";

// Plane should be big enough to cover the whole canvas
const PLANE_SIZE = 10;

export default class Raycaster {
  raycaster: ThreeRaycaster;
  camera: PerspectiveCamera;
  mesh: Mesh;
  pointer = new Vector2();
  intersection = new Vector3();

  constructor({ camera }: { camera: PerspectiveCamera }) {
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onRender = this.onRender.bind(this);

    this.camera = camera;
    this.raycaster = new ThreeRaycaster();
    this.mesh = new Mesh(
      new PlaneGeometry(PLANE_SIZE, PLANE_SIZE),
      new MeshBasicMaterial()
    );

    window.addEventListener("mousemove", this.onPointerMove);

    emitter.on("render", this.onRender);
  }

  onPointerMove({ clientX, clientY }: MouseEvent) {
    this.pointer.x = (clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
  }

  onRender() {
    const intersects = this.raycaster.intersectObjects([this.mesh]);
    if (intersects.length > 0) {
      this.intersection.copy(intersects[0].point);
    }
  }
}
