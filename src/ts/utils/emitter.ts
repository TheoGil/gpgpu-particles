import mitt from "mitt";

const emitter = mitt<{
  render: { deltaTime: number; elapsedTime: number };
  resize: { width: number; height: number };
}>();

export { emitter };
