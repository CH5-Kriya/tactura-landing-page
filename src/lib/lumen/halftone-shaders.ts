/*! LUMEN Halftone shader, Copyright (c) 2026 Leonxlnx, MIT.
 * Source: https://github.com/Leonxlnx/lumenshaders (js/shaders.js).
 * Only shared helpers, Halftone and grading retained; equations unchanged.
 * License: /licenses/lumen.txt. */
export const vertexSource = "#version 300 es\nlayout(location=0) in vec2 a_pos;\nvoid main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }\n";

export const fragmentSource = `#version 300 es

precision highp float;
precision highp int;

uniform vec2  u_res;
uniform float u_phase;     // 0..1 loop phase
uniform float u_seed;
uniform int   u_mode;

uniform vec3  u_c1, u_c2, u_c3, u_c4, u_bg;
uniform float u_hue, u_sat, u_exposure, u_contrast;

uniform float u_scale;     // zoom: higher = larger forms
uniform float u_complex;   // fbm octaves 1..8
uniform float u_warp;
uniform float u_flow;      // extra turbulence
uniform float u_stretch;   // -1..1 anisotropy

uniform float u_light, u_gloss, u_lightAngle, u_irid, u_glow;

uniform float u_grain, u_cell, u_lines, u_ca, u_vig, u_soft;
uniform float u_travel;

/* synth: procedural style combinator (legacy share codes) */
uniform int   u_synth;     // 0 = single mode, 1 = blend two modes
uniform int   u_modeB;
uniform int   u_mixOp;     // 0 noise mask, 1 screen, 2 multiply, 3 radial, 4 diagonal
uniform float u_blend;

/* genome: parametric style synthesizer, every gene set is its own style */
uniform int   u_genome;    // 1 = render the genome style
uniform vec4  u_g1;        // field type, domain op, warp amount, fold count
uniform vec4  u_g2;        // color map, shading, overlay, overlay scale
uniform vec4  u_g3;        // ridge sharpness, poster steps, field scale, rotation

out vec4 fragColor;

#define TAU 6.28318530718
#define PI  3.14159265359

/* ---------------- noise ---------------- */

/* fract-first hashes stay precise for large inputs (big seeds, far cells) */
float hash11(float n){
  n = fract(n * 0.1031);
  n *= n + 33.33;
  n *= n + n;
  return fract(n);
}
float hash21(vec2 p){
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
vec2 hash22(vec2 p){
  float n = hash21(p);
  return vec2(n, hash21(p+n+17.13));
}

float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  float a = hash21(i);
  float b = hash21(i+vec2(1,0));
  float c = hash21(i+vec2(0,1));
  float d = hash21(i+vec2(1,1));
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}

mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }

float fbm(vec2 p){
  float v = 0.0, a = 0.5, tot = 0.0;
  mat2 R = rot(0.62);
  for (int i = 0; i < 8; i++){
    float w = clamp(u_complex - float(i), 0.0, 1.0);
    if (w <= 0.0) break;
    v += a*w*vnoise(p);
    tot += a*w;
    a *= 0.55;
    p = R*p*2.03 + 11.7;
  }
  return v/max(tot, 1e-4);
}

/* loop offset: orbit in noise space -> perfect loop */
vec2 LT(){ return vec2(cos(TAU*u_phase), sin(TAU*u_phase)) * u_travel; }
vec2 SO(){ return vec2(hash11(u_seed*0.137 + 0.731)*61.7, hash11(u_seed*0.213 + 7.0)*47.3); }

/* ---------------- color ---------------- */

vec3 palette(float t){
  t = clamp(t, 0.0, 1.0);
  float x = t*3.0;
  vec3 c = mix(u_c1, u_c2, smoothstep(0.0,1.0,x));
  c = mix(c, u_c3, smoothstep(1.0,2.0,x));
  c = mix(c, u_c4, smoothstep(2.0,3.0,x));
  return c;
}
vec3 paletteCyc(float t){
  t = fract(t);
  float x = t*4.0;
  vec3 c = mix(u_c1, u_c2, smoothstep(0.0,1.0,x));
  c = mix(c, u_c3, smoothstep(1.0,2.0,x));
  c = mix(c, u_c4, smoothstep(2.0,3.0,x));
  c = mix(c, u_c1, smoothstep(3.0,4.0,x));
  return c;
}

vec3 hueRotate(vec3 c, float deg){
  float a = deg*PI/180.0;
  float cs = cos(a), sn = sin(a);
  mat3 m = mat3(
    0.299+0.701*cs+0.168*sn, 0.587-0.587*cs+0.330*sn, 0.114-0.114*cs-0.497*sn,
    0.299-0.299*cs-0.328*sn, 0.587+0.413*cs+0.035*sn, 0.114-0.114*cs+0.292*sn,
    0.299-0.300*cs+1.250*sn, 0.587-0.588*cs-1.050*sn, 0.114+0.886*cs-0.203*sn);
  return c*m;
}

/* ---------------- shared coords ---------------- */

vec2 toP(vec2 uv){
  float asp = u_res.x/u_res.y;
  vec2 p = (uv - 0.5) * vec2(asp, 1.0) * (3.0/max(u_scale, 0.15));
  p.x *= mix(1.0, 0.38, clamp(u_stretch, 0.0, 1.0));
  p.y *= mix(1.0, 0.38, clamp(-u_stretch, 0.0, 1.0));
  return p;
}

vec3 sceneHalftone(vec2 uv){
  float asp = u_res.x/u_res.y;
  vec2 so = SO(), lt = LT();
  vec2 guv = uv*vec2(asp,1.0)*u_cell*0.55;
  vec2 gp = floor(guv);
  vec2 gf = fract(guv)-0.5;
  vec2 cuv = (gp+0.5)/(u_cell*0.55)/vec2(asp,1.0);
  vec2 cp = toP(cuv);

  vec2 q = cp + u_warp*0.9*vec2(fbm(cp*0.7+so+lt)-0.5, fbm(cp*0.7-so-lt)-0.5)*2.0;
  float f = fbm(q + so);
  f = smoothstep(0.30, 0.80, f);     /* large breathing-room voids */

  float radius = sqrt(f)*0.62;
  float dotm = smoothstep(radius, radius-0.12, length(gf));
  float hueF = fbm(q*0.55 + so + 31.7);
  vec3 ink = palette(clamp(hueF*1.5 - 0.22, 0.0, 1.0));
  return mix(u_bg, ink, dotm*(0.30 + 0.70*f));
}

void main(){
  vec2 uv = gl_FragCoord.xy/u_res;
  vec3 col = sceneHalftone(uv);

  /* chromatic fringe: cheap radial channel split, no scene re-render */
  if (u_ca > 0.004){
    float asp0 = u_res.x/u_res.y;
    float r2 = length((uv - 0.5)*vec2(asp0, 1.0));
    float w = clamp(u_ca, 0.0, 1.0)*smoothstep(0.18, 0.85, r2)*0.45;
    vec3 shifted = vec3(
      hueRotate(col,  10.0).r,
      col.g,
      hueRotate(col, -10.0).b);
    col = mix(col, shifted, w);
  }

  /* glow: soft luminance knee */
  float lum = dot(col, vec3(0.299,0.587,0.114));
  col += u_glow * col * lum * 0.85;

  /* grade */
  if (abs(u_hue) > 0.5) col = hueRotate(col, u_hue);
  float l2 = dot(col, vec3(0.299,0.587,0.114));
  col = mix(vec3(l2), col, u_sat);
  col *= u_exposure;
  col = (col - 0.5)*u_contrast + 0.5;

  /* vignette */
  float asp = u_res.x/u_res.y;
  vec2 vc = (uv-0.5)*vec2(asp,1.0);
  col *= 1.0 - u_vig*smoothstep(0.35, 1.05, length(vc));

  /* film grain — quantized steps keep the loop perfect */
  float gstep = floor(u_phase*24.0);
  float gr = hash21(gl_FragCoord.xy*0.71 + vec2(gstep*3.1, gstep*7.7));
  col += (gr-0.5)*u_grain*0.55;

  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;
