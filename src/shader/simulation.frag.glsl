// #include utils/snoise3;
#include utils/rand;

varying vec2 vUv;

uniform float uTime;

uniform sampler2D uCurrentPosition;
uniform sampler2D uOriginalPosition1;
uniform sampler2D uOriginalPosition2;

uniform float uProgress;

uniform float uPointerRepelStrength;
uniform float uMaxSpeed;
uniform float uPointerRepelAreaRadius;
uniform float uPointerRepelAreaPow;

uniform vec3 uMousePosition;

uniform float uNoiseAmp;
uniform float uNoiseFreq;

// TODO - Use uniforms to control those values  
float uFriction = 0.925; 
float uMaxForce = 0.15;


void main() {
    vec2 currentPosition = texture2D(uCurrentPosition, vUv).xy;
    vec2 originalPosition1 = texture2D(uOriginalPosition1, vUv).xy;
    vec2 originalPosition2 = texture2D(uOriginalPosition2, vUv).xy;
    vec2 target = mix(originalPosition1, originalPosition2, uProgress);

    float offset = rand(vUv);

    vec2 velocity = texture2D(uCurrentPosition, vUv).zw;
    vec2 originalVelocity = velocity;

    /**
     * Flee from pointer
     */
    float distanceTopointer = distance(currentPosition, uMousePosition.xy);
    if (distanceTopointer < uPointerRepelAreaRadius) {
      // Modulate repel strength based on distance between particule and pointer.
      // Particule closer to pointer are more repeled.
      float fleeStrength = pow(1.0 - distanceTopointer / uPointerRepelAreaRadius, uPointerRepelAreaPow);

      // fleeStrength *= uMaxSpeed;

      fleeStrength *= uPointerRepelStrength;

      vec2 fleeForce = ((uMousePosition.xy - currentPosition) * fleeStrength) - velocity;
      velocity -= fleeForce;

      // // Apply force to current position 
      currentPosition.xy += velocity;

      //////////////////////////////////
      //////////////////////////////////
      //////////////////////////////////
      //////////////////////////////////

      // vec2 desired = normalize(uMousePosition.xy - currentPosition) * uMaxSpeed;
      // vec2 steer = desired - velocity;
      // steer *= uMaxForce;
      // // steer.x = clamp(steer.x, -uMaxForce, uMaxForce);
      // // steer.y = clamp(steer.y, -uMaxForce, uMaxForce);
      // velocity -= steer;
    }    
    
    /**
     * Seek return to target position
     */
    vec2 seekForce = ((target - currentPosition) * uMaxSpeed) - velocity;
    velocity += seekForce;
    
    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    currentPosition.xy += velocity;
    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    

    // Friction
    // velocity *= uFriction;
    
    gl_FragColor = vec4(currentPosition, velocity);
}