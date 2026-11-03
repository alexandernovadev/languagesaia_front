  // ═════════════ BRUNO — the guardian coach ═════════════
  const hex = (x, y, r = 3) => { const p = []; for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3; p.push((x + Math.cos(a) * r).toFixed(1) + ',' + (y + Math.sin(a) * r).toFixed(1)); } return `<polygon class="m2" points="${p.join(' ')}"/><circle class="m3" cx="${x}" cy="${y}" r="${(r * .4).toFixed(1)}"/>`; };
  const brunoLeg = (side) => {
    const x = side === 'l' ? 70 : 104, cx = x + 13, bx = side === 'l' ? 62 : 102, cap = side === 'l' ? 62 : 122;
    return `
  <g class="leg-${side}" ${O(cx, 168)}>
   <rect class="cd" x="${x}" y="166" width="26" height="32" rx="12"/>
   <rect class="hl" x="${x + 4}" y="170" width="3" height="20" rx="1.5"/>
   <path class="shade" d="M${x + 18} 167 h2 a6 6 0 0 1 6 6 v18 a6 6 0 0 1 -6 6 h-2 z"/>
   <g class="shin-${side}" ${O(cx, 196)}>
    <rect class="cd" x="${x}" y="192" width="26" height="32" rx="12"/>
    <rect class="a-butter" x="${x + 9}" y="203" width="8" height="14" rx="3"/><rect class="shade" x="${x + 9}" y="213" width="8" height="4" rx="2"/>
    <path class="m1" d="M${bx} 220 h36 v16 a9 9 0 0 1 -9 9 h-18 a9 9 0 0 1 -9 -9 z"/>
    <rect class="m3" x="${bx + 2}" y="223" width="32" height="4" rx="2"/><rect class="m4" x="${bx + 16}" y="221.5" width="5" height="7" rx="1.2"/>
    <rect class="c" x="${cap}" y="232" width="16" height="13" rx="6"/><rect class="hl" x="${cap + 3}" y="234" width="6" height="2" rx="1"/>
    <path class="stroke-m3" stroke-width="1.2" d="M${bx + 4} 244 h3 M${bx + 11} 244 h3 M${bx + 18} 244 h3 M${bx + 25} 244 h3"/>
   </g>
   <rect class="m3" x="${x + 2}" y="186" width="22" height="15" rx="7"/>
   <rect class="hl" x="${x + 5}" y="188" width="10" height="2.4" rx="1.2"/>
   ${hex(cx, 193.5, 3.2)}
  </g>`;
  };
  const brunoArm = (side) => {
    const x = side === 'l' ? 46 : 130, cx = x + 12, s = side === 'l' ? 1 : -1;
    return `
  <g class="arm-${side}" ${O(cx, 104)}>
   <rect class="c" x="${x}" y="100" width="24" height="34" rx="12"/>
   <rect class="hl" x="${x + 4}" y="104" width="3" height="22" rx="1.5"/>
   <rect class="cd" x="${x}" y="115" width="24" height="5" rx="2"/>
   <g class="fore-${side}" ${O(cx, 132)}>
    <rect class="m2" x="${x - 3}" y="130" width="30" height="26" rx="11"/>
    <rect class="hl" x="${x + 1}" y="132" width="10" height="2.4" rx="1.2"/>
    <path class="seam" d="M${x - 2} 148.5 h28"/>
    <rect class="led gled" x="${x + 2}" y="139" width="20" height="4" rx="2"/>
    <circle class="m3" cx="${cx}" cy="162" r="14"/>
    <path class="shade" d="M${cx + 3} 148.5 a14 14 0 0 1 0 27 a10 13.5 0 0 0 0 -27 z"/>
    <rect class="m2" x="${cx - 10}" y="151" width="20" height="7" rx="3"/>
    ${screw(cx - 5, 154.5, 1.6)}${screw(cx + 5, 154.5, 1.6)}
    <path class="stroke-m2" stroke-width="2" d="M${cx - 8} 163 h16 M${cx - 8} 168 h16"/>
    <circle class="m3" cx="${cx + s * 11}" cy="160" r="5"/><path class="seam" d="M${cx + s * 9} 158 l${s * 3} 3"/>
   </g>
   <circle class="m2" cx="${cx}" cy="132" r="5"/><circle class="m3" cx="${cx}" cy="132" r="2"/>
  </g>`;
  };
  const bruno = () => `
<svg class="robot r-bruno c-butter" viewBox="0 0 200 260" data-mood="idle" role="img" aria-label="Bruno, robot de Exámenes">
 <g class="body-all" ${O(100, 246)}>
  <g class="torso" ${O(100, 170)}>
   <rect class="m2" x="50" y="76" width="22" height="60" rx="11"/><rect class="m2" x="128" y="76" width="22" height="60" rx="11"/>
   <rect class="hl" x="54" y="80" width="3" height="48" rx="1.5"/><rect class="hl" x="132" y="80" width="3" height="48" rx="1.5"/>
   <rect class="a-butter" x="50" y="96" width="22" height="5"/><rect class="a-butter" x="128" y="96" width="22" height="5"/>
   <circle class="m4" cx="61" cy="86" r="5"/><path class="stroke-m1" stroke-width="1.2" d="M61 86 l2.5 -2.5"/>
   <circle class="m4" cx="139" cy="86" r="5"/><path class="stroke-m1" stroke-width="1.2" d="M139 86 l-2.5 -2.5"/>
   <rect class="m1" x="54" y="132" width="14" height="10" rx="3"/><rect class="m1" x="132" y="132" width="14" height="10" rx="3"/>
   <g class="flight">
    <path class="fl-o flame" d="M54 142 Q61 190 68 142Z"/><path class="fl-i flame" d="M57 142 Q61 174 65 142Z"/>
    <path class="fl-o flame" d="M132 142 Q139 190 146 142Z"/><path class="fl-i flame" d="M135 142 Q139 174 143 142Z"/>
   </g>
   <g class="sway" ${O(100, 92)}>
    <path class="cd" d="M64 92 Q100 84 136 92 L146 178 L130 170 L116 182 L100 172 L84 182 L70 170 L54 178 Z"/>
    <path class="shade" d="M64 92 Q100 84 136 92 L138 108 Q100 98 62 108 Z"/>
   </g>
  </g>
  ${brunoLeg('l')}${brunoLeg('r')}
  ${brunoArm('l')}
  <g class="torso" ${O(100, 170)}>
   <path class="c" d="M60 92 Q100 82 140 92 L134 170 Q100 178 66 170 Z"/>
   <path class="shade" d="M124 88 Q134 90 140 92 L134 170 Q126 173 118 174 Q130 130 124 88 Z"/>
   <path class="seam" d="M70 140 Q100 146 130 140 M100 146 V174"/>
   <ellipse class="shine" cx="74" cy="102" rx="8" ry="3.5" transform="rotate(-25 74 102)"/>
   <path class="cd" d="M84 146 h32 v14 a6 6 0 0 1 -6 6 h-20 a6 6 0 0 1 -6 -6 z" opacity=".55"/>
   <path class="stroke-cd" stroke-width="2" d="M100 146 v20 M84 156 h32"/>
   <path class="stroke-cd" stroke-width="3" d="M100 100 L123 106.5 L121 126.5 Q114.5 139.5 100 147 Q85.5 139.5 79 126.5 L77 106.5 Z"/>
   <path class="inkf" d="M100 102 L121 108 L119 126 Q113 138 100 145 Q87 138 81 126 L79 108 Z"/>
   <path class="hl-s" d="M84 110 L98 106"/>
   <path class="check" d="M90 122 L97 129 L111 113"/>
   <path class="cord" d="M114 92 Q112 100 106 104"/>
   <g class="whistle">
    <path class="cord" d="M86 92 Q84 112 72 124"/>
    <rect class="m4" x="60" y="121" width="16" height="9" rx="4.5"/><rect class="m3" x="73" y="122.5" width="5" height="6" rx="1.5"/><circle class="m4" cx="62" cy="125.5" r="5.5"/><circle class="m2" cx="62" cy="125.5" r="2"/><path class="hl-s" d="M63 122.5 h8"/>
   </g>
   <rect class="m1" x="66" y="158" width="68" height="11"/>
   <rect class="m2" x="72" y="156" width="12" height="13" rx="2.5"/><rect class="m3" x="72" y="156" width="12" height="4" rx="1.5"/>
   <rect class="m2" x="116" y="156" width="12" height="13" rx="2.5"/><rect class="m3" x="116" y="156" width="12" height="4" rx="1.5"/>
   <circle class="m4" cx="100" cy="165" r="9"/><circle class="stroke-m3" stroke-width="1" cx="100" cy="165" r="7.4"/>
   <path class="stroke-m1" stroke-width="1" d="M100 158.2 v1.6 M100 170.2 v1.6 M93.2 165 h1.6 M105.2 165 h1.6"/>
   <circle class="m1" cx="100" cy="165" r="1.5"/>
   <path class="stroke-m1 hand" stroke-width="1.6" d="M100 165 V159.5"/>
   <rect class="m3" x="98" y="153.5" width="4" height="3" rx="1"/>
   <g class="shoulders" ${O(100, 98)}>
    <ellipse class="cd" cx="60" cy="98" rx="23" ry="16"/><ellipse class="cd" cx="140" cy="98" rx="23" ry="16"/>
    <path class="stroke-m2" stroke-width="2.2" d="M40 102 Q60 92 80 102 M120 102 Q140 92 160 102"/>
    <ellipse class="shine" cx="52" cy="90" rx="7" ry="2.6"/><ellipse class="shine" cx="132" cy="90" rx="7" ry="2.6"/>
    <path class="shade" d="M38 100 Q60 116 82 100 Q80 114 60 114 Q42 114 38 100 Z M118 100 Q140 116 162 100 Q160 114 140 114 Q122 114 118 100 Z"/>
    ${screw(48, 98, 2)}${screw(60, 87, 2)}${screw(72, 98, 2)}${screw(128, 98, 2)}${screw(140, 87, 2)}${screw(152, 98, 2)}
   </g>
  </g>
  ${brunoArm('r')}
  <g class="head" ${O(100, 86)}>
   <rect class="m2" x="86" y="70" width="28" height="16" rx="5"/>
   <path class="stroke-m1" stroke-width="2" d="M92 74 v8 M100 74 v8 M108 74 v8"/>
   <path class="stroke-m1" stroke-width="2.4" d="M86 80 q-6 2 -8 8 M114 80 q6 2 8 8"/>
   <g class="wobble" ${O(100, 26)}><path class="cd" d="M90 26 Q100 0 110 26 Z"/><path class="seam" d="M95 22 l2 -8 M100 20 v-10 M105 22 l-2 -8"/><path class="hl-s" d="M96 18 q2 -6 4 -9"/></g>
   <rect class="m3" x="69" y="40" width="7" height="16" rx="3.5"/><rect class="m3" x="124" y="40" width="7" height="16" rx="3.5"/>
   ${hex(72.5, 48, 2.6)}${hex(127.5, 48, 2.6)}
   <rect class="c" x="73" y="20" width="54" height="56" rx="22"/>
   <rect class="cd" x="96" y="20" width="8" height="18" rx="3"/>
   <path class="shade" d="M118 22 q9 6 9 22 v8 q0 18 -16 24 h-3 q16 -8 16 -30 q0 -16 -6 -24 z"/>
   <ellipse class="shine" cx="85" cy="27" rx="7" ry="3" transform="rotate(-15 85 27)"/>
   <path class="m3" d="M78 60 h44 v4 a12 12 0 0 1 -12 12 h-20 a12 12 0 0 1 -12 -12 z"/>
   <path class="shade" d="M78 66 h44 a12 12 0 0 1 -12 10 h-20 a12 12 0 0 1 -12 -10 z" opacity=".6"/>
   <path class="stroke-m2" stroke-width="2" d="M82 63.5 v6 M86 64 v7 M114 64 v7 M118 63.5 v6"/>
   <rect class="vis" x="90" y="63" width="20" height="9" rx="3.5"/>
   <rect class="vis" x="75" y="37" width="50" height="21" rx="10.5"/>
   <path class="glare" style="stroke-opacity:.18" d="M80 55 L92 39"/>
   <g class="eyes" ${O(100, 48)}>
    <g class="f-idle"><path class="cd" d="M78.5 35.5 L97 40 L97 44 L78.5 40 Z"/><path class="cd" d="M121.5 35.5 L103 40 L103 44 L121.5 40 Z"/><rect class="led blink" x="83" y="44.5" width="13" height="8" rx="4"/><rect class="led blink" x="104" y="44.5" width="13" height="8" rx="4"/><circle class="m4" cx="86.5" cy="46.8" r="1.1"/><circle class="m4" cx="107.5" cy="46.8" r="1.1"/><path class="led-s" style="stroke-width:2" d="M94 67.5 q6 2.5 12 0"/></g>
    <g class="f-happy"><path class="cd" d="M78.5 34 q9.5 -4 18.5 0 v3.6 q-9 -4 -18.5 0 z"/><path class="cd" d="M103 34 q9.5 -4 18.5 0 v3.6 q-9.5 -4 -18.5 0 z"/><path class="led-s" d="M83 51.5 q6.5 -9 13 0 M104 51.5 q6.5 -9 13 0"/><path class="led" d="M93 65.5 q7 5.5 14 0 Z"/></g>
    <g class="f-party"><path class="cd" d="M78.5 32 q9.5 -5 18.5 0 v3.6 q-9 -5 -18.5 0 z"/><path class="cd" d="M103 32 q9.5 -5 18.5 0 v3.6 q-9.5 -5 -18.5 0 z"/><polygon class="led" points="${star(89.5, 47.5, 7)}"/><polygon class="led" points="${star(110.5, 47.5, 7)}"/><path class="led" d="M93 64.5 q7 7 14 0 Z"/></g>
    <g class="f-think"><path class="cd" d="M78.5 40 h18.5 v3.6 h-18.5 z"/><path class="cd" d="M103 36 L121.5 32.5 L121.5 36.2 L103 39.6 Z"/><rect class="led" x="83" y="46" width="13" height="4" rx="2"/><rect class="led" x="104" y="43" width="13" height="9" rx="4.5"/><circle class="m4" cx="107.5" cy="45.4" r="1.1"/><rect class="scan" x="78" y="54" width="8" height="2" rx="1"/><path class="led-s" style="stroke-width:1.8" d="M93.5 68 l3.2 -2 l3.3 2 l3.3 -2 l3.2 2"/></g>
    <g class="f-sad"><path class="cd" d="M78.5 42 L97 37 L97 41 L78.5 45.6 Z"/><path class="cd" d="M121.5 42 L103 37 L103 41 L121.5 45.6 Z"/><path class="led" d="M83 47 L96 49.5 L96 53 Q89.5 54 83 52 Z"/><path class="led" d="M117 47 L104 49.5 L104 53 Q110.5 54 117 52 Z"/><path class="led-s" style="stroke-width:2" d="M94 70 q6 -3 12 0"/><circle class="tear" cx="88" cy="56" r="1.6"/></g>
    <g class="f-sleep"><path class="cd" d="M78.5 41 h18.5 v4.4 h-18.5 z"/><path class="cd" d="M103 41 h18.5 v4.4 h-18.5 z"/><path class="led-s" style="stroke-width:3" d="M83 49.5 h13 M104 49.5 h13"/><path class="led-s snoreline" style="stroke-width:2" d="M96 67.5 h8"/></g>
   </g>
   <text class="zz" x="130" y="28">z</text><text class="zz" x="138" y="16">z</text>
  </g>
 </g>
</svg>`;

