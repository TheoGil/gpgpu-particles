varying vec2 vUv;
uniform float time;

uniform sampler2D uCurrentPosition;

void main() {
    vUv = uv;
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    gl_Position = projectionMatrix * mvPosition;
}
