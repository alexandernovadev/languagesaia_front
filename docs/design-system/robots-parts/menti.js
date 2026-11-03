  // ═════════════ MENTI — the memory ninja ═════════════
  const mentiArm = (side) => {
    const s = side === 'l' ? -1 : 1, sx = 100 + s * 22, ex = 100 + s * 33, hx = 100 + s * 40;
    return `
  <g class="arm-${side}" ${O(sx, 182)}>
   <path class="noodle" d="M${sx} 182 q${s * 7} 2 ${s * 11} 9"/>
   <path class="seg" d="M${sx + s * 4} 180.6 l${s * -.8} 3.4 M${sx + s * 8} 182.6 l${s * -1.8} 3"/>
   <g class="fore-${side}" ${O(ex, 191)}>
    <path class="noodle" d="M${ex} 191 q${s * 5} 6 ${s * 7} 12"/>
    <path class="seg" d="M${ex + s * 2} 195.5 l${s * 3} -1.4 M${ex + s * 4} 199.5 l${s * 3} -.6"/>
    <circle class="m4" cx="${hx}" cy="205" r="7"/>
    <circle class="m4" cx="${hx - s * 6}" cy="201.5" r="3"/>
    <path class="seam" d="M${hx - 4} 206.5 h8"/><path class="shade" d="M${hx + s * 2} 199 a7 7 0 0 1 0 13 a5 6.5 0 0 0 0 -13 z"/>
   </g>
   <circle class="m3" cx="${ex}" cy="191" r="2.8"/><circle class="m2" cx="${ex}" cy="191" r="1"/>
  </g>`;
  };
  const card = (x, y, r, g) => `<g transform="translate(${x} ${y}) rotate(${r})"><rect class="card-f" x="-10" y="-13" width="20" height="26" rx="4"/><text class="glyph card-t" x="0" y="-2">${g}</text><path class="card-l" d="M-6 6 h12 M-6 9.5 h8"/></g>`;
  const menti = () => `
<svg class="robot r-menti c-mint" viewBox="0 0 200 260" data-mood="idle" role="img" aria-label="Menti, robot de Anki">
 <g class="body-all" ${O(100, 216)}>
  <g class="orbit">${card(28, 160, -12, 'A')}${card(172, 160, 12, '?')}${card(100, 232, 6, '✓')}</g>
  <path class="beam" d="M86 216 L114 216 L126 254 L74 254 Z"/>
  <g class="flight"><path class="beam" d="M80 216 L120 216 L140 262 L60 262 Z"/><path class="fl-o flame" d="M90 216 Q100 252 110 216Z"/><path class="fl-i flame" d="M94 216 Q100 238 106 216Z"/></g>
  <path class="m2" d="M76 204 A24 14 0 0 0 124 204 Z"/>
  <path class="shade" d="M108 204 h16 A24 14 0 0 1 104 217.6 Q112 212 108 204 Z"/>
  <path class="stroke-m1" stroke-width="1.6" d="M84 208 v4 M92 209 v5 M100 209.5 v5 M108 209 v5 M116 208 v4"/>
  <ellipse class="ring" cx="100" cy="214.5" rx="15" ry="3.5"/>
  <rect class="m3" x="76" y="202.5" width="48" height="3.5" rx="1.75"/>
  ${mentiArm('l')}
  <g class="torso" ${O(100, 208)}>
   <ellipse class="c" cx="100" cy="188" rx="27" ry="22"/>
   <path class="shade" d="M112 168 a27 22 0 0 1 0 40 a20 21 0 0 0 0 -40 z"/>
   <path class="seam" d="M74 192 q26 9 52 0"/>
   <ellipse class="shine" cx="86" cy="177" rx="6" ry="2.5" transform="rotate(-25 86 177)"/>
   <rect class="inkf" x="90" y="179" width="20" height="16" rx="3"/>
   <path class="stroke-m3" stroke-width="1.5" d="M93 179 v-3 M98 179 v-3 M103 179 v-3 M108 179 v-3 M93 195 v3 M98 195 v3 M103 195 v3 M108 195 v3 M90 183 h-3 M90 191 h-3 M110 183 h3 M110 191 h3"/>
   <rect class="led chip" x="95.5" y="184" width="9" height="6" rx="1.5"/><path class="stroke-c" stroke-width=".8" d="M92 181.5 h3 M105 192.5 h3"/>
   <circle class="m1" cx="94" cy="202" r="1.2"/><circle class="m1" cx="100" cy="203" r="1.2"/><circle class="m1" cx="106" cy="202" r="1.2"/>
  </g>
  ${mentiArm('r')}
  <g class="head" ${O(100, 166)}>
   <g class="wobble" ${O(100, 80)}>
    <path class="stroke-m3" stroke-width="3" d="M100 80 q7 -4 0 -8 q-7 -4 0 -8 q7 -4 0 -8 q-7 -4 0 -8"/>
    <circle class="bulb" cx="100" cy="46" r="6.5"/><circle class="hl" cx="98" cy="44" r="1.8"/>
    <g class="ant"><text class="glyph ag ag-happy" x="100" y="46.6">♥</text><text class="glyph ag ag-party" x="100" y="46.6">★</text><text class="glyph ag ag-think" x="100" y="46.8">?</text><text class="glyph ag ag-sad" x="100" y="45.6">…</text><text class="glyph ag ag-sleep" x="100" y="46.6">z</text></g>
   </g>
   <rect class="cd" x="51" y="110" width="11" height="26" rx="5.5"/><rect class="cd" x="138" y="110" width="11" height="26" rx="5.5"/>
   <rect class="led" x="54.6" y="114" width="3.8" height="12" rx="1.9"/><rect class="led" x="141.6" y="114" width="3.8" height="12" rx="1.9"/>
   <circle class="m3" cx="56.5" cy="131" r="1.6"/><circle class="m3" cx="143.5" cy="131" r="1.6"/>
   <circle class="c" cx="100" cy="122" r="44"/>
   <path class="shade" d="M122 84 a44 44 0 0 1 0 76 a36 40 0 0 0 0 -76 z"/>
   <ellipse class="shine" cx="78" cy="96" rx="12" ry="5" transform="rotate(-30 78 96)"/><circle class="shine" cx="70" cy="106" r="2"/>
   <path class="cd" d="M57 104 Q100 92 143 104 L144 116 Q100 104 56 116 Z"/>
   <path class="stitch" d="M58 107 Q100 96 142 107 M57.4 113 Q100 102 142.6 113"/>
   <g class="sway" ${O(142, 110)}>
    <path class="cd" d="M144 106 q22 -6 34 4 l-5 7 q-12 -8 -29 -4 z"/>
    <path class="cd" d="M144 112 q20 4 26 20 l-7 2 q-6 -12 -19 -16 z"/>
    <path class="stitch" d="M146 108 q18 -4 28 3 M147 115 q15 4 20 15"/>
    <circle class="cd" cx="143" cy="110" r="6"/><path class="seam" d="M140 107 q3 3 6 6"/>
   </g>
   <circle class="m1" cx="100" cy="134" r="25"/>
   ${screw(100, 111, 1.8)}${screw(123, 134, 1.8)}${screw(100, 157, 1.8)}${screw(77, 134, 1.8)}
   <circle class="stroke-m3" stroke-width="2" cx="100" cy="134" r="21.5"/>
   <circle class="vis" cx="100" cy="134" r="19"/>
   <path class="blade" d="M100 115.5 l3 5 M118.1 128.3 l-5 1.8 M111.4 149.1 l-2.4 -4.7 M88.6 149.1 l2.4 -4.7 M81.9 128.3 l5 1.8"/>
   <g class="eyes" ${O(100, 134)}>
    <g class="f-idle"><circle class="led blink" cx="100" cy="134" r="9"/><circle class="iris-ring blink" cx="100" cy="134" r="6.4"/><circle class="vis blink" cx="100" cy="134" r="4"/><circle class="m4" cx="104" cy="129.5" r="2.5"/><circle class="m4" cx="96.4" cy="138.2" r="1.1"/></g>
    <g class="f-happy"><path class="led-s" style="stroke-width:5" d="M88 136 q12 -16 24 0"/><path class="lid" d="M82 140 Q100 128 118 140 A19 19 0 0 1 82 140 Z"/><ellipse class="blushled" cx="68" cy="142" rx="5" ry="2.6"/><ellipse class="blushled" cx="132" cy="142" rx="5" ry="2.6"/></g>
    <g class="f-party"><polygon class="led" points="${star(100, 134, 13)}"/><circle class="led" cx="86" cy="122" r="1.4"/><circle class="led" cx="115" cy="146" r="1.4"/><circle class="led" cx="114" cy="121" r="1"/><ellipse class="blushled" cx="68" cy="142" rx="5" ry="2.6"/><ellipse class="blushled" cx="132" cy="142" rx="5" ry="2.6"/></g>
    <g class="f-think"><circle class="led" cx="106" cy="129" r="7"/><circle class="iris-ring" cx="106" cy="129" r="5"/><circle class="vis" cx="107" cy="128" r="3"/><circle class="m4" cx="109" cy="125.6" r="1.6"/><path class="lid" d="M81.7 129 A19 19 0 0 1 114.7 122 Z"/><circle class="spin" cx="100" cy="134" r="15"/></g>
    <g class="f-sad"><circle class="led" cx="100" cy="140" r="7"/><circle class="iris-ring" cx="100" cy="140" r="5"/><circle class="vis" cx="100" cy="141" r="3"/><circle class="m4" cx="102.6" cy="137" r="1.5"/><path class="lid" d="M81.4 130 Q100 121 118.6 130 A19 19 0 0 0 81.4 130 Z"/><circle class="tear" cx="90" cy="150" r="2"/></g>
    <g class="f-sleep"><circle class="lid" cx="100" cy="134" r="19.5"/><path class="led-s" style="stroke-width:4" d="M88 134 q12 7 24 0"/><ellipse class="blushled" cx="68" cy="142" rx="5" ry="2.6"/><ellipse class="blushled" cx="132" cy="142" rx="5" ry="2.6"/></g>
   </g>
   <path class="glare" style="stroke-opacity:.25" d="M88 122 q4 -5 10 -6"/>
   <text class="zz" x="140" y="80">z</text><text class="zz" x="148" y="68">z</text>
  </g>
 </g>
</svg>`;

