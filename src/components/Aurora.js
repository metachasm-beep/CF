import React, { useMemo, useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import { 
  useSharedValue, 
  useDerivedValue, 
  withRepeat, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import {
  Canvas,
  Fill,
  Shader,
  Skia,
} from '@shopify/react-native-skia';

const source = Skia.RuntimeEffect.Make(`
uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ), 
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

half4 main(vec2 fragCoord) {
  vec2 uv = fragCoord.xy / uResolution;
  
  vec3 rampColor;
  if (uv.x < 0.5) {
     rampColor = mix(uColorStops[0], uColorStops[1], uv.x * 2.0);
  } else {
     rampColor = mix(uColorStops[1], uColorStops[2], (uv.x - 0.5) * 2.0);
  }
  
  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.01, uTime * 0.025)) * 0.5 * uAmplitude;
  height = exp(height);
  height = (uv.y * 2.0 - height + 0.2);
  float intensity = 0.6 * height;
  
  float midPoint = 0.20;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);
  
  vec3 auroraColor = intensity * rampColor;
  
  return half4(auroraColor * auroraAlpha, auroraAlpha);
}
`);

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255
  ] : [0, 0, 0];
};

export const Aurora = ({ colorStops = ['#5227FF', '#7cff67', '#5227FF'], amplitude = 1.0, blend = 0.5 }) => {
  const { width, height } = useWindowDimensions();
  const time = useSharedValue(0);

  useEffect(() => {
    time.value = withRepeat(
      withTiming(100, { duration: 100000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const colors = useMemo(() => {
    return colorStops.flatMap(hex => hexToRgb(hex));
  }, [colorStops]);

  const uniforms = useDerivedValue(() => {
    return {
      uTime: time.value,
      uAmplitude: amplitude,
      uColorStops: colors,
      uResolution: [width, height],
      uBlend: blend,
    };
  }, [time, amplitude, colors, width, height, blend]);

  if (!source) {
    return null;
  }

  return (
    <Canvas style={{ width, height, position: 'absolute' }}>
      <Fill>
        <Shader source={source} uniforms={uniforms} />
      </Fill>
    </Canvas>
  );
};

export default Aurora; // Refreshed component
