/* Fumaça do hero e do orçamento. Usada ao vivo no desktop e por tools/gerar_video.py
   para renderizar os MP4 dos aparelhos de toque. `a` é a fase do loop (0 a 2π) e `k` o
   raio do movimento: o quadro em a = 2π é igual ao de a = 0, então o vídeo fecha sem emenda.
   Fios finos e claros sobre véus cinza, mais densos embaixo, com um frio leve (o azul do cabelo dela). */
window.FUMACA_FS = `precision mediump float;
uniform vec2 r;uniform float a;uniform float k;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,b=.5;mat2 R=mat2(.8,.6,-.6,.8);for(int i=0;i<5;i++){v+=b*n(p);p=R*p*2.03;b*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/r.y; vec2 c=gl_FragCoord.xy/r;
  vec2 o1=vec2(cos(a),sin(a))*k, o2=vec2(sin(a),-cos(a))*k*.8;
  vec2 w=uv*vec2(1.1,.8)+vec2(0.,-uv.y*.15);
  vec2 q=vec2(fbm(w+o1),fbm(w+vec2(4.1,2.7)-o2));
  vec2 s=vec2(fbm(w+2.6*q+vec2(1.3,7.9)+o2),fbm(w+2.6*q+vec2(6.2,1.8)-o1*.7));
  float f=fbm(w*1.2+3.2*s);
  float veu=smoothstep(.32,1.,f*f*1.6+.18*length(q));
  float fio=fbm(uv*vec2(2.2,1.5)+s*2.4+q);
  fio=pow(1.-abs(fio-.5)*2.,9.);
  float base=smoothstep(1.05,-.1,c.y);
  float lado=smoothstep(.18,.62,abs(c.x-.5));
  float m=.2+.8*clamp(base*.9+lado*.55,0.,1.);
  float v=(veu*.62+fio*.75)*m;
  vec3 col=vec3(.043,.039,.043);
  col=mix(col,vec3(.50,.53,.53),clamp(veu*m*.55,0.,1.));
  col+=vec3(.80,.86,.86)*fio*m*.5;
  col*=1.-.55*dot(c-.5,c-.5);
  gl_FragColor=vec4(col,1.);
}`;

/* Liga o shader num canvas. Devolve {desenhar(fase, raio)} ou null se não houver WebGL. */
window.fumacaGL = function (tela, opcoes) {
  const gl = tela.getContext('webgl', Object.assign({ antialias: false, powerPreference: 'low-power' }, opcoes || {}));
  if (!gl) return null;
  const sh = (tipo, src) => { const o = gl.createShader(tipo); gl.shaderSource(o, src); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null; };
  const v = sh(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}');
  const f = sh(gl.FRAGMENT_SHADER, window.FUMACA_FS);
  if (!v || !f) return null;
  const pr = gl.createProgram(); gl.attachShader(pr, v); gl.attachShader(pr, f); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
  gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const lp = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0);
  const uR = gl.getUniformLocation(pr, 'r'), uA = gl.getUniformLocation(pr, 'a'), uK = gl.getUniformLocation(pr, 'k');
  return {
    desenhar(fase, raio) {
      gl.viewport(0, 0, tela.width, tela.height);
      gl.uniform2f(uR, tela.width, tela.height);
      gl.uniform1f(uA, fase);
      gl.uniform1f(uK, raio);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
  };
};
