  const screw = (x, y, r = 2.2) => `<circle class="m3" cx="${x}" cy="${y}" r="${r}"/><path class="seam" d="M${(x - r * .6).toFixed(1)} ${y} h${(r * 1.2).toFixed(1)}"/>`;

  // ═════════════ LUMI — the scholar ═════════════
  const lumiLeg = (side) => {
    const x = side === 'l' ? 84 : 104, cx = x + 6, sx = side === 'l' ? 74 : 100;
    return `
  <g class="leg-${side}" ${O(cx, 168)}>
   <rect class="cd" x="${x}" y="166" width="12" height="38" rx="6"/>
   <rect class="hl" x="${x + 2}" y="170" width="2.4" height="28" rx="1.2"/>
   <g class="shin-${side}" ${O(cx, 200)}>
    <rect class="cd" x="${x}" y="198" width="12" height="32" rx="6"/>
    <rect class="hl" x="${x + 2}" y="206" width="2.4" height="18" rx="1.2"/>
    <rect class="m3" x="${x - 1}" y="223" width="14" height="5" rx="2.5"/>
    <rect class="m1" x="${sx}" y="227" width="26" height="16" rx="8"/>
    <ellipse class="m2" cx="${sx + 13}" cy="235" rx="9" ry="3.4"/>
    <path class="stroke-m4" stroke-width="1.3" d="M${sx + 9} 229.5 l4 2 l4 -2 M${sx + 9} 232.5 l4 2 l4 -2"/>
    <rect class="m4" x="${sx}" y="238.5" width="26" height="5" rx="2.5"/>
    <path class="seam" d="M${sx + 4} 241 h2 M${sx + 9} 241 h2 M${sx + 14} 241 h2 M${sx + 19} 241 h2"/>
    <ellipse class="shine" cx="${sx + 7}" cy="230" rx="3" ry="1.4"/>
   </g>
   <circle class="m3" cx="${cx}" cy="200" r="6.5"/><circle class="stroke-m2" stroke-width="1.4" cx="${cx}" cy="200" r="4"/><circle class="m2" cx="${cx}" cy="200" r="1.8"/>
  </g>`;
  };
  const lumiArm = (side) => {
    const x = side === 'l' ? 66 : 122, cx = x + 6, s = side === 'l' ? 1 : -1;
    return `
  <g class="arm-${side}" ${O(cx, 100)}>
   <rect class="c" x="${x}" y="96" width="12" height="34" rx="6"/>
   <rect class="hl" x="${x + 2}" y="100" width="2.4" height="24" rx="1.2"/>
   <g class="fore-${side}" ${O(cx, 130)}>
    <rect class="c" x="${x}" y="130" width="12" height="28" rx="6"/>
    <ellipse class="cd" cx="${cx}" cy="138.5" rx="4.4" ry="5.6"/><ellipse class="stitch" cx="${cx}" cy="138.5" rx="3.1" ry="4.3"/>
    <rect class="a-butter" x="${x - 1}" y="147" width="14" height="6" rx="3"/>
    <path class="seam" d="M${x + 2.5} 147.6 v5 M${x + 6} 147.6 v5 M${x + 9.5} 147.6 v5"/>
    <circle class="m4" cx="${cx}" cy="162" r="7"/>
    <circle class="m4" cx="${cx + s * 6}" cy="158.5" r="3"/>
    <path class="seam" d="M${cx - 3} 165 v3 M${cx} 165.6 v3 M${cx + 3} 165 v3"/>
   </g>
   <circle class="m3" cx="${cx}" cy="130" r="5.5"/><circle class="m2" cx="${cx}" cy="130" r="2"/>
  </g>`;
  };
  const lumi = () => `
<svg class="robot r-lumi c-sky" viewBox="0 0 200 260" data-mood="idle" role="img" aria-label="Lumi, robot de Palabras">
 <g class="body-all" ${O(100, 246)}>
  <g class="torso" ${O(100, 160)}>
   <g class="flight">
    <path class="fl-o flame" d="M76 150 Q83 186 90 150Z"/><path class="fl-i flame" d="M79 150 Q83 172 87 150Z"/>
    <path class="fl-o flame" d="M110 150 Q117 186 124 150Z"/><path class="fl-i flame" d="M113 150 Q117 172 121 150Z"/>
   </g>
   <g class="sway" ${O(118, 148)}><path class="ribbon" d="M114.5 146 v26 l3.5 -4 l3.5 4 v-26 z"/></g>
   <rect class="a-butter-d" x="69" y="98" width="62" height="54" rx="8"/>
   <rect class="m4" x="71" y="102" width="3.5" height="46" rx="1.5"/><rect class="m4" x="125.5" y="102" width="3.5" height="46" rx="1.5"/>
   <path class="seam" d="M71 110 h3.5 M71 118 h3.5 M71 126 h3.5 M71 134 h3.5 M71 142 h3.5 M125.5 110 h3.5 M125.5 118 h3.5 M125.5 126 h3.5 M125.5 134 h3.5 M125.5 142 h3.5"/>
   <rect class="m2" x="80" y="146" width="10" height="6" rx="2"/><rect class="m2" x="110" y="146" width="10" height="6" rx="2"/>
   <g class="sway" ${O(88, 94)}>
    <path class="a-butter" d="M92 88 C70 94 54 118 32 116 L30 132 C54 138 70 118 94 104 Z"/>
    <path class="shade" d="M94 104 C70 118 54 138 30 132 L30.6 128 C54 133 70 114 93 99 Z"/>
    <path class="stroke-cd" stroke-width="3" d="M50 118 L47 133 M41 117 L38 132"/>
    <path class="stroke-cd" stroke-width="2" d="M30 132 l-3 6 M34 133 l-1 7 M38 133 l1 7"/>
   </g>
  </g>
  ${lumiLeg('l')}${lumiLeg('r')}
  <rect class="m2" x="78" y="150" width="44" height="24" rx="10"/>
  <rect class="m1" x="78" y="168" width="44" height="4" rx="2" opacity=".55"/>
  <path class="seam" d="M100 158 v14 M86 155.5 q4 5 9 5 M114 155.5 q-4 5 -9 5"/>
  ${lumiArm('l')}
  <g class="torso" ${O(100, 160)}>
   <rect class="c" x="72" y="90" width="56" height="68" rx="22"/>
   <path class="shade" d="M118 92 q10 4 10 22 v22 q0 22 -22 22 h-4 q20 -6 20 -40 z"/>
   <path class="m4" d="M88 92 L100 120 L112 92 Z"/>
   <path class="m4" d="M88 92 l-6 7 l9 1 z M112 92 l6 7 l-9 1 z"/>
   <path class="stroke-cd" stroke-width="3" d="M88 93 L100 121 L112 93"/>
   <path class="stitch" d="M86 98 L98 126 M114 98 L102 126"/>
   <circle class="cd" cx="100" cy="130" r="2.8"/><circle class="hl" cx="99.2" cy="129.2" r="1"/>
   <circle class="cd" cx="100" cy="141" r="2.8"/><circle class="hl" cx="99.2" cy="140.2" r="1"/>
   <rect class="cd" x="107" y="128" width="14" height="11" rx="3"/><path class="stitch" d="M108.5 131 h11"/>
   <rect class="a-butter" x="110" y="121" width="3.5" height="11" rx="1.75"/><rect class="m1" x="115.5" y="123" width="3" height="9" rx="1.5"/><rect class="m3" x="116" y="122" width="2" height="5" rx="1"/>
   <ellipse class="shine" cx="82" cy="100" rx="6" ry="3" transform="rotate(-30 82 100)"/>
   <rect class="m1" x="72" y="148" width="56" height="9"/>
   <rect class="m4" x="82" y="146.5" width="10" height="12" rx="2"/><rect class="shade" x="82" y="155.5" width="10" height="3" rx="1"/><text class="glyph tile-t" x="87" y="152">A</text>
   <rect class="m4" x="95" y="146.5" width="10" height="12" rx="2"/><rect class="shade" x="95" y="155.5" width="10" height="3" rx="1"/><text class="glyph tile-t" x="100" y="152">B</text>
   <rect class="m4" x="108" y="146.5" width="10" height="12" rx="2"/><rect class="shade" x="108" y="155.5" width="10" height="3" rx="1"/><text class="glyph tile-t" x="113" y="152">C</text>
   <rect class="a-butter" x="80" y="84" width="40" height="13" rx="6.5"/>
   <path class="stroke-cd" stroke-width="3" d="M91 85 v11 M100 85 v11 M109 85 v11"/>
   <rect class="shade" x="80" y="93" width="40" height="4" rx="2"/>
   <g class="sway" ${O(92, 96)}>
    <path class="a-butter" d="M89 95 l-5 20 l8 2 l4 -21 z"/>
    <path class="stroke-cd" stroke-width="2.4" d="M88 102 l7 1.5 M86.5 109 l7 1.5"/>
    <path class="stroke-cd" stroke-width="1.4" d="M84.5 115.5 l-1 4 M87.5 116.2 l0 4 M90.5 116.8 l1 4"/>
   </g>
   <circle class="a-butter-d" cx="93" cy="96" r="4.2"/><circle class="hl" cx="92" cy="95" r="1.4"/>
  </g>
  ${lumiArm('r')}
  <g class="orb"><circle class="orb-ring" cx="158" cy="128" r="16.5"/><circle class="orb-c" cx="158" cy="128" r="12"/><text class="glyph orb-t" x="158" y="128.5">A</text><circle class="hl" cx="153" cy="123" r="2.4"/></g>
  <g class="head" ${O(100, 86)}>
   <rect class="m3" x="93" y="76" width="14" height="12" rx="3"/>
   <rect class="m2" x="92" y="79" width="16" height="2.5" rx="1.25"/><rect class="m2" x="92" y="84" width="16" height="2.5" rx="1.25"/>
   <g class="wobble" ${O(112, 24)}>
    <path class="a-butter" d="M110 22 C118 6 134 -2 144 0 C140 12 126 20 112 26 Z"/>
    <path class="stroke-m1" stroke-width="1.5" d="M112 24 L140 3"/>
    <path class="stroke-cd" stroke-width="1.1" d="M118 19 l-3 -6 M123 15 l-2.5 -6 M128 12 l-2 -6 M133 8 l-1.5 -5 M118 19 l5 2 M124 15 l5 2 M130 11 l5 2"/>
    <path class="m1" d="M109 27 l3.5 -5 l2.5 2.5 z"/>
   </g>
   <circle class="cd" cx="68" cy="52" r="7.5"/><circle class="stroke-m3" stroke-width="1.6" cx="68" cy="52" r="5"/>${screw(67, 52, 2)}
   <circle class="cd" cx="132" cy="52" r="7.5"/><circle class="stroke-m3" stroke-width="1.6" cx="132" cy="52" r="5"/>${screw(133, 52, 2)}
   <rect class="c" x="68" y="16" width="64" height="66" rx="30"/>
   <path class="shade" d="M120 20 q12 8 12 30 v6 q0 22 -22 26 h-6 q24 -8 24 -40 q0 -14 -8 -22 z"/>
   <path class="seam" d="M71 34 Q100 25 129 34"/>
   <ellipse class="shine" cx="84" cy="25" rx="10" ry="3.5" transform="rotate(-20 84 25)"/>
   <rect class="vis" x="75" y="34" width="50" height="38" rx="17"/>
   <rect class="hl" x="84" y="36" width="32" height="2.2" rx="1.1" opacity=".08"/>
   <g class="eyes" ${O(100, 52)}>
    <g class="f-idle"><circle class="led blink" cx="89" cy="50" r="4.5"/><circle class="led blink" cx="111" cy="50" r="4.5"/><circle class="m4" cx="90.6" cy="48.3" r="1.4"/><circle class="m4" cx="112.6" cy="48.3" r="1.4"/><circle class="m4" cx="87.6" cy="51.8" r=".7"/><circle class="m4" cx="109.6" cy="51.8" r=".7"/><path class="led-s brow" d="M84 38 q5 -2 10 0 M106 38 q5 -2 10 0"/><path class="led-s" style="stroke-width:2.5" d="M94 64 q6 4 12 0"/><ellipse class="blushled" cx="80" cy="63" rx="3.2" ry="1.7"/><ellipse class="blushled" cx="120" cy="63" rx="3.2" ry="1.7"/></g>
    <g class="f-happy"><path class="led-s" d="M83 53 q6 -8 12 0 M105 53 q6 -8 12 0"/><path class="led-s brow" d="M84 36.5 q5 -3 10 0 M106 36.5 q5 -3 10 0"/><path class="led" d="M93 60.5 q7 8 14 0 Z"/><path class="tongue" d="M97 64.2 q3 2.4 6 0 q-3 -1.6 -6 0z"/><ellipse class="blushled" cx="80" cy="62" rx="3.8" ry="2"/><ellipse class="blushled" cx="120" cy="62" rx="3.8" ry="2"/></g>
    <g class="f-party"><polygon class="led" points="${star(89, 50, 7)}"/><polygon class="led" points="${star(111, 50, 7)}"/><path class="led-s brow" d="M83 35.5 q6 -4 12 0 M105 35.5 q6 -4 12 0"/><path class="led" d="M92 60 q8 11 16 0 Z"/><path class="tongue" d="M96.5 65 q3.5 2.8 7 0 q-3.5 -2 -7 0z"/><ellipse class="blushled" cx="80" cy="62" rx="3.8" ry="2"/><ellipse class="blushled" cx="120" cy="62" rx="3.8" ry="2"/></g>
    <g class="f-think"><circle class="led" cx="92" cy="46.5" r="3.6"/><circle class="led" cx="114" cy="46.5" r="3.6"/><circle class="m4" cx="93.2" cy="45.3" r="1.1"/><circle class="m4" cx="115.2" cy="45.3" r="1.1"/><path class="led-s brow" d="M84 39.5 h10 M106 37 q5 -4 10 -1"/><path class="led-s" style="stroke-width:2.4" d="M95 65 q2.5 -2.2 5 0 q2.5 2.2 5 0"/></g>
    <g class="f-sad"><circle class="led" cx="89" cy="53" r="3.6"/><circle class="led" cx="111" cy="53" r="3.6"/><circle class="m4" cx="90.2" cy="51.8" r="1.1"/><circle class="m4" cx="112.2" cy="51.8" r="1.1"/><path class="led-s brow" d="M84 40.5 L94 37.5 M116 40.5 L106 37.5"/><path class="led-s" style="stroke-width:2.5" d="M94 66 q6 -4 12 0"/><circle class="tear" cx="85" cy="59" r="1.8"/></g>
    <g class="f-sleep"><path class="led-s" style="stroke-width:3" d="M84 51 q5 3 10 0 M106 51 q5 3 10 0"/><path class="led-s brow" d="M84 41 q5 1 10 0 M106 41 q5 1 10 0"/><circle class="led snore" cx="100" cy="64" r="2.2"/><ellipse class="blushled" cx="80" cy="62" rx="3.2" ry="1.7"/><ellipse class="blushled" cx="120" cy="62" rx="3.2" ry="1.7"/></g>
   </g>
   <circle class="stroke-m4" stroke-width="2.5" cx="89" cy="50" r="10"/><circle class="stroke-m4" stroke-width="2.5" cx="111" cy="50" r="10"/>
   <path class="glare" d="M82.5 46 l4 -4.5 M104.5 46 l4 -4.5"/>
   <path class="stroke-m4" stroke-width="2.5" d="M99 49 q1 -2 2 0 M79 47 l-4 -2 M121 47 l4 -2"/>
   <text class="zz" x="134" y="26">z</text><text class="zz" x="142" y="14">z</text>
  </g>
 </g>
</svg>`;

