  // ═════════════ NUBO — the field analyst ═════════════
  const nuboLeg = (side) => {
    const x = side === 'l' ? 87 : 103, cx = x + 5, bx = side === 'l' ? 80 : 100;
    return `
  <g class="leg-${side}" ${O(cx, 168)}>
   <rect class="legging" x="${x}" y="166" width="10" height="36" rx="5"/>
   <rect class="hl" x="${x + 2}" y="170" width="2" height="26" rx="1"/>
   <g class="shin-${side}" ${O(cx, 200)}>
    <g class="flight"><ellipse class="hover" cx="${bx + 10}" cy="248" rx="11" ry="3"/></g>
    <rect class="legging" x="${x}" y="198" width="10" height="24" rx="5"/>
    <rect class="hl" x="${x + 2}" y="203" width="2" height="14" rx="1"/>
    <rect class="c" x="${bx}" y="214" width="20" height="26" rx="7"/>
    <path class="shade" d="M${bx + 14} 215 h1 a5 5 0 0 1 5 5 v14 a6 6 0 0 1 -6 6 h-2 z"/>
    <rect class="cd" x="${bx - 1}" y="212" width="22" height="6" rx="3"/><path class="stitch" d="M${bx} 215 h20"/>
    <path class="lace" d="M${bx + 5} 221 l10 4 M${bx + 15} 221 l-10 4 M${bx + 5} 227 l10 4 M${bx + 15} 227 l-10 4"/>
    <ellipse class="cd" cx="${bx + 10}" cy="235.5" rx="8" ry="3"/><ellipse class="hl" cx="${bx + 8}" cy="234.6" rx="3" ry="1"/>
    <rect class="m1" x="${bx - 1}" y="237" width="22" height="6" rx="3"/>
    <path class="stroke-m3" stroke-width="1" d="M${bx + 3} 241 h2 M${bx + 8} 241 h2 M${bx + 13} 241 h2"/>
    <ellipse class="shine" cx="${bx + 5}" cy="219" rx="3" ry="1.5"/>
   </g>
   <circle class="m3" cx="${cx}" cy="200" r="4.5"/><circle class="m2" cx="${cx}" cy="200" r="1.6"/>
  </g>`;
  };
  const nubo = () => `
<svg class="robot r-nubo c-lilac" viewBox="0 0 200 260" data-mood="idle" role="img" aria-label="Nubo, robot de Expresiones">
 <g class="body-all" ${O(100, 246)}>
  <g class="torso" ${O(100, 150)}>
   <g class="flight">
    <path class="stroke-m3" stroke-width="3" d="M100 96 V8"/>
    <ellipse class="m3 rotor" cx="100" cy="8" rx="30" ry="3.5"/>
    <circle class="m1" cx="100" cy="8" r="4"/><circle class="led" cx="100" cy="8" r="1.6"/>
   </g>
   <rect class="m2" x="72" y="94" width="56" height="54" rx="14"/>
   <path class="seam" d="M74 108 h52"/>
   <rect class="m1" x="66" y="112" width="8" height="26" rx="4"/><rect class="m1" x="126" y="112" width="8" height="26" rx="4"/>
   <rect class="m3" x="67" y="118" width="6" height="3" rx="1"/><rect class="m3" x="127" y="118" width="6" height="3" rx="1"/>
   <g class="wobble" ${O(80, 98)}>
    <path class="stroke-m3" stroke-width="2.5" d="M80 98 L66 72"/>
    <circle class="m3" cx="73" cy="85" r="2"/>
    <g transform="rotate(-28 62 66)"><g class="dish"><ellipse class="m4" cx="62" cy="66" rx="11" ry="5"/><ellipse class="m3" cx="62" cy="66" rx="6" ry="2.6"/><path class="stroke-m3" stroke-width="1.2" d="M62 66 v-7"/></g></g>
    <circle class="led" cx="62" cy="58.5" r="2"/>
   </g>
  </g>
  ${nuboLeg('l')}${nuboLeg('r')}
  <g class="skirt" ${O(100, 146)}>
   <path class="cd" d="M78 144 L122 144 L129 174 Q100 181 71 174 Z"/>
   <path class="shade" d="M106 146 L122 146 L129 174 Q118 177 111 178 Z" opacity=".7"/>
   <path class="stroke-c" stroke-width="1.6" d="M88 146 l-4 30 M100 146 v32 M112 146 l4 30"/>
   <path class="shade" d="M71 174 Q100 181 129 174 L128.4 170.5 Q100 177 71.6 170.5 Z"/>
   <path class="a-butter" d="M71 171 Q100 178 129 171 L129.6 174 Q100 181 70.4 174 Z"/>
  </g>
  <g class="torso" ${O(100, 150)}>
   <rect class="knit" x="82" y="88" width="36" height="58" rx="12"/>
   <path class="stroke-knit" d="M92 98 v44 M97 98 v44 M103 98 v44 M108 98 v44"/>
   <path class="c" d="M74 96 Q78 88 91 88 L95 148 L76 148 Q71 122 74 96 Z"/>
   <path class="c" d="M126 96 Q122 88 109 88 L105 148 L124 148 Q129 122 126 96 Z"/>
   <path class="shade" d="M126 96 Q129 122 124 148 L117 148 Q123 122 120 91 Z"/>
   <path class="stitch" d="M89 92 L92.6 146 M111 92 L107.4 146 M76.6 100 Q74 122 78 146 M123.4 100 Q126 122 122 146"/>
   <path class="stroke-cd" stroke-width="1.6" d="M91 89 L95 147 M109 89 L105 147"/>
   <rect class="a-butter" x="79.5" y="99" width="2.5" height="10" rx="1.25"/><rect class="m4" x="83.5" y="100" width="2.5" height="9" rx="1.25"/><rect class="m1" x="87" y="101" width="2" height="8" rx="1"/>
   <rect class="m3" x="80" y="100" width="1.5" height="4" rx=".5"/>
   <rect class="cd" x="77" y="108" width="13" height="11" rx="2"/><rect class="c" x="76.5" y="105.5" width="14" height="5" rx="2"/><rect class="shade" x="76.5" y="109" width="14" height="1.5"/><circle class="a-butter" cx="83.5" cy="108" r="1.3"/>
   <rect class="cd" x="110" y="108" width="13" height="11" rx="2"/><rect class="c" x="109.5" y="105.5" width="14" height="5" rx="2"/><rect class="shade" x="109.5" y="109" width="14" height="1.5"/><circle class="a-butter" cx="116.5" cy="108" r="1.3"/>
   <rect class="cd" x="77" y="127" width="14" height="13" rx="2.5"/><rect class="c" x="76.5" y="124.5" width="15" height="5" rx="2"/><circle class="a-butter" cx="84" cy="127" r="1.3"/>
   <rect class="cd" x="109" y="127" width="14" height="13" rx="2.5"/><rect class="c" x="108.5" y="124.5" width="15" height="5" rx="2"/><circle class="a-butter" cx="116" cy="127" r="1.3"/>
   <path class="a-butter" d="M111 94 h10 a2.5 2.5 0 0 1 2.5 2.5 v3 a2.5 2.5 0 0 1 -2.5 2.5 h-5 l-3 3 v-3 h-2 a2.5 2.5 0 0 1 -2.5 -2.5 v-3 a2.5 2.5 0 0 1 2.5 -2.5 z"/>
   <circle class="m1" cx="113.5" cy="98" r=".9"/><circle class="m1" cx="116.5" cy="98" r=".9"/><circle class="m1" cx="119.5" cy="98" r=".9"/>
   <path class="stroke-m2" stroke-width="4.5" d="M81 90 L83 140 M119 90 L117 140"/>
   <rect class="m3" x="79" y="114" width="7" height="5" rx="1.5"/><rect class="m3" x="114" y="114" width="7" height="5" rx="1.5"/>
   <rect class="m1" x="76" y="140" width="48" height="7" rx="3"/><rect class="a-butter" x="95.5" y="139" width="9" height="9" rx="2"/><rect class="m1" x="98" y="141.5" width="4" height="4" rx="1"/>
   <rect class="knit" x="88" y="83" width="24" height="10" rx="5"/><path class="stroke-m3" stroke-width="1.2" d="M90 88 h20"/><path class="stroke-knit" d="M92 84 v8 M96 84 v8 M100 84 v8 M104 84 v8 M108 84 v8"/>
   <ellipse class="shine" cx="80" cy="99" rx="4" ry="2" transform="rotate(-30 80 99)"/>
  </g>
  <g class="arm-l" ${O(76, 98)}>
   <rect class="knit" x="69" y="94" width="14" height="32" rx="7"/>
   <path class="stroke-knit" d="M73 98 v24 M79 98 v24"/>
   <g class="fore-l" ${O(76, 126)}>
    <rect class="knit" x="70" y="124" width="12" height="30" rx="6"/>
    <g transform="rotate(-6 64 142)">
     <rect class="tab-glow" x="50" y="122" width="26" height="38" rx="6"/>
     <rect class="tab-frame" x="52" y="124" width="22" height="34" rx="4"/>
     <rect class="tab-screen" x="55" y="128" width="16" height="24" rx="2"/>
     <path class="led" d="M57 131 h8 a2 2 0 0 1 2 2 v3 a2 2 0 0 1 -2 2 h-4 l-2 2 v-2 h-2 a2 2 0 0 1 -2 -2 v-3 a2 2 0 0 1 2 -2 z"/>
     <circle class="tab-screen" cx="59" cy="134.5" r=".7"/><circle class="tab-screen" cx="61" cy="134.5" r=".7"/><circle class="tab-screen" cx="63" cy="134.5" r=".7"/>
     <rect class="led bar" x="57" y="144" width="2.5" height="6" rx="1"/><rect class="led bar" x="61" y="144" width="2.5" height="6" rx="1"/><rect class="led bar" x="65" y="144" width="2.5" height="6" rx="1"/><rect class="led bar" x="69" y="144" width="1.5" height="6" rx=".75"/>
     <circle class="m2" cx="63" cy="155" r="1.4"/>
    </g>
    <rect class="cd" x="69" y="146" width="14" height="5" rx="2.5"/>
    <circle class="c" cx="76" cy="157" r="7"/><circle class="c" cx="82" cy="153.5" r="3"/><path class="stroke-cd" stroke-width="1.4" d="M72 160 h8"/>
   </g>
   <circle class="m3" cx="76" cy="126" r="3.4"/>
  </g>
  <g class="head" ${O(100, 86)}>
   <rect class="m3" x="94" y="76" width="12" height="12" rx="3"/><rect class="m2" x="93" y="80" width="14" height="2.4" rx="1.2"/>
   <g class="wobble" ${O(80, 34)}><circle class="cd" cx="73" cy="25" r="12"/><path class="shade" d="M79 15 a12 12 0 0 1 -6 22 a12 12 0 0 0 6 -22 z"/><path class="stroke-c" stroke-width="2" d="M65 22 q8 -8 16 0"/><path class="tie" d="M63 31 q10 7 20 0"/><circle class="a-butter" cx="66" cy="17" r="2.6"/><circle class="a-butter" cx="80" cy="15" r="2"/></g>
   <g class="wobble bun-r" ${O(120, 34)}><circle class="cd" cx="127" cy="25" r="12"/><path class="shade" d="M133 15 a12 12 0 0 1 -6 22 a12 12 0 0 0 6 -22 z"/><path class="stroke-c" stroke-width="2" d="M119 22 q8 -8 16 0"/><path class="tie" d="M117 31 q10 7 20 0"/><circle class="a-butter" cx="134" cy="17" r="2.6"/><circle class="a-butter" cx="120" cy="15" r="2"/></g>
   <rect class="c" x="70" y="18" width="60" height="64" rx="28"/>
   <path class="shade" d="M121 22 q9 8 9 28 v6 q0 22 -22 26 h-4 q22 -8 22 -40 q0 -12 -5 -20 z"/>
   <path class="cd" d="M71 44 Q75 27 89 31 Q95 20 104 30 Q117 22 129 44 L130 34 Q100 6 70 34 Z"/>
   <path class="hl-s" d="M80 31 q4 -4 9 -2 M99 25 q4 -3 8 0 M113 27 q5 -1 8 3"/>
   <ellipse class="shine" cx="86" cy="23" rx="8" ry="2.5" transform="rotate(-12 86 23)"/>
   <rect class="face" x="78" y="38" width="44" height="38" rx="17"/>
   <rect class="hl" x="86" y="40" width="28" height="2" rx="1" opacity=".07"/>
   <g class="eyes" ${O(100, 56)}>
    <g class="f-idle"><ellipse class="led blink" cx="89" cy="55" rx="4.8" ry="6.5"/><ellipse class="led blink" cx="111" cy="55" rx="4.8" ry="6.5"/><circle class="m4" cx="90.6" cy="52.4" r="1.6"/><circle class="m4" cx="112.6" cy="52.4" r="1.6"/><circle class="m4" cx="87.8" cy="57.6" r=".8"/><circle class="m4" cx="109.8" cy="57.6" r=".8"/><path class="led-s lash" d="M84 50 l-3 -2 M85 47.5 l-1.5 -3 M116 50 l3 -2 M115 47.5 l1.5 -3"/><path class="led-s brow" d="M85 44.5 q4 -2.2 8 0 M107 44.5 q4 -2.2 8 0"/><path class="led-s" style="stroke-width:2.4" d="M96 68 q4 3 8 0"/><ellipse class="blushled" cx="84" cy="64" rx="3.6" ry="2"/><ellipse class="blushled" cx="116" cy="64" rx="3.6" ry="2"/></g>
    <g class="f-happy"><path class="led-s" d="M84 57 q5 -7 10 0 M106 57 q5 -7 10 0"/><path class="led-s lash" d="M84 54 l-3 -2 M116 54 l3 -2"/><path class="led-s brow" d="M85 43 q4 -3 8 0 M107 43 q4 -3 8 0"/><path class="led" d="M94 65 q6 7 12 0 Z"/><path class="tongue" d="M97.5 68 q2.5 1.8 5 0 q-2.5 -1.4 -5 0z"/><ellipse class="blushled" cx="84" cy="63" rx="4" ry="2.2"/><ellipse class="blushled" cx="116" cy="63" rx="4" ry="2.2"/></g>
    <g class="f-party"><polygon class="led" points="${star(89, 55, 7)}"/><polygon class="led" points="${star(111, 55, 7)}"/><path class="led-s brow" d="M84 42 q5 -3.5 10 0 M106 42 q5 -3.5 10 0"/><path class="led" d="M93 64 q7 9 14 0 Z"/><path class="tongue" d="M97 68.4 q3 2.2 6 0 q-3 -1.6 -6 0z"/><ellipse class="blushled" cx="83" cy="64" rx="4" ry="2.2"/><ellipse class="blushled" cx="117" cy="64" rx="4" ry="2.2"/></g>
    <g class="f-think"><path class="led-s" style="stroke-width:3" d="M84 56 h10"/><path class="led-s lash" d="M84 55 l-3 -2"/><path class="led-s brow" d="M85 48.5 h8 M107 43 q4 -3.2 9 -1"/><ellipse class="led" cx="112" cy="54" rx="5.5" ry="7"/><circle class="m4" cx="113.6" cy="51.2" r="1.6"/><circle class="m4" cx="110.6" cy="57" r=".8"/><circle class="led" cx="102" cy="68" r="2"/></g>
    <g class="f-sad"><ellipse class="led" cx="89" cy="58" rx="4" ry="4.5"/><ellipse class="led" cx="111" cy="58" rx="4" ry="4.5"/><circle class="m4" cx="90.2" cy="56.4" r="1.2"/><circle class="m4" cx="112.2" cy="56.4" r="1.2"/><path class="led-s brow" d="M83 50 L93 46 M117 50 L107 46"/><path class="led-s" style="stroke-width:2.4" d="M96 70 q4 -3 8 0"/><circle class="tear" cx="86" cy="64" r="1.8"/></g>
    <g class="f-sleep"><path class="led-s" style="stroke-width:3" d="M84 56 q5 3 10 0 M106 56 q5 3 10 0"/><path class="led-s lash" d="M84 57 l-3 2 M116 57 l3 2"/><path class="led-s brow" d="M85 47.5 q4 1 8 0 M107 47.5 q4 1 8 0"/><circle class="led snore" cx="100" cy="68" r="2"/><ellipse class="blushled" cx="84" cy="63" rx="3.6" ry="2"/><ellipse class="blushled" cx="116" cy="63" rx="3.6" ry="2"/></g>
   </g>
   <g class="sway" ${O(72, 46)}><path class="cd" d="M73 44 q-8 14 -3 30 q5 -2 6 -7 q-3 -10 1 -21 z"/><path class="hl-s" d="M71 50 q-3 8 -1 16"/></g>
   <g class="sway lock-r" ${O(128, 46)}><path class="cd" d="M127 44 q8 14 3 30 q-5 -2 -6 -7 q3 -10 -1 -21 z"/></g>
   <circle class="hud" cx="111" cy="55" r="10.5"/>
   <path class="hud-grid" d="M102 55 h18 M111 46 v18 M101.5 47.5 v-3 h3 M120.5 47.5 v-3 h-3 M101.5 62.5 v3 h3 M120.5 62.5 v3 h-3"/>
   <rect class="hud-scan" x="102" y="49" width="18" height="1.6" rx=".8"/>
   <path class="stroke-m3" stroke-width="2.2" d="M121 52 Q129 50 131 56"/>
   <path class="stroke-m2" stroke-width="3" d="M71 50 Q70 13 100 11 Q130 13 129 50"/>
   <path class="hl-s" d="M78 24 Q86 15 98 13.5"/>
   <circle class="m2" cx="70" cy="56" r="9"/><circle class="stroke-m3" stroke-width="1.2" cx="70" cy="56" r="6.5"/><circle class="cup-led" cx="70" cy="56" r="3.6"/>
   <circle class="m2" cx="130" cy="56" r="8"/><circle class="m3" cx="130" cy="56" r="3"/><path class="seam" d="M128 56 h4"/>
   <path class="stroke-m2" stroke-width="2.5" d="M70 63 Q73 76 85 75"/><circle class="m2" cx="86.5" cy="75" r="3.4"/><circle class="led mic" cx="86.5" cy="75" r="2"/>
   <text class="zz" x="140" y="34">z</text><text class="zz" x="148" y="22">z</text>
  </g>
  <g class="arm-r" ${O(124, 98)}>
   <rect class="knit" x="117" y="94" width="14" height="32" rx="7"/>
   <path class="stroke-knit" d="M121 98 v24 M127 98 v24"/>
   <g class="fore-r" ${O(124, 126)}>
    <rect class="knit" x="118" y="124" width="12" height="30" rx="6"/>
    <rect class="cd" x="117" y="146" width="14" height="5" rx="2.5"/>
    <rect class="m1" x="121.5" y="160" width="5" height="18" rx="2.5"/>
    <path class="stroke-m3" stroke-width="1.1" d="M121.5 165 h5 M121.5 168.5 h5 M121.5 172 h5"/>
    <rect class="a-butter-d" x="120.5" y="175.5" width="7" height="3" rx="1"/>
    <circle class="mag-glass" cx="124" cy="188" r="10"/>
    <circle class="mag-ring" cx="124" cy="188" r="11"/>
    <path class="glint" d="M118 183 q3 -4 7 -4"/><circle class="glint" cx="129.5" cy="193" r=".6"/>
    <circle class="c" cx="124" cy="157" r="7"/><circle class="c" cx="118" cy="153.5" r="3"/><path class="stroke-cd" stroke-width="1.4" d="M120 160 h8"/>
   </g>
   <circle class="m3" cx="124" cy="126" r="3.4"/>
  </g>
 </g>
</svg>`;

