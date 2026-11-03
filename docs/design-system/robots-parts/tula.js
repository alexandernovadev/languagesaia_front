  // ═════════════ TULA — the explorer ═════════════
  const tulaLeg = (side) => {
    const x = side === 'l' ? 80 : 103, cx = x + 8.5, bx = side === 'l' ? 77 : 101, toe = side === 'l' ? 82 : 118, fx = side === 'l' ? 74 : 114, px = side === 'l' ? 82 : 110;
    return `
  <g class="leg-${side}" ${O(cx, 162)}>
   <rect class="m2" x="${x}" y="160" width="17" height="38" rx="8"/>
   <rect class="hl" x="${x + 3}" y="164" width="2.4" height="26" rx="1.2"/>
   <path class="seam" d="M${cx} 162 v24"/>
   <rect class="m1" x="${px}" y="168" width="8" height="10" rx="2"/><rect class="m2" x="${px - .5}" y="167" width="9" height="3.5" rx="1.2"/><circle class="m3" cx="${px + 4}" cy="169" r="1"/>
   <g class="shin-${side}" ${O(cx, 194)}>
    <g class="flight"><path class="fl-o flame" d="M${fx} 244 Q${fx + 6} 272 ${fx + 12} 244Z"/><path class="fl-i flame" d="M${fx + 3} 244 Q${fx + 6} 262 ${fx + 9} 244Z"/></g>
    <rect class="m2" x="${x}" y="192" width="17" height="24" rx="8"/>
    <rect class="m1" x="${bx}" y="212" width="22" height="30" rx="7"/>
    <rect class="hl" x="${bx + 3}" y="217" width="2.4" height="18" rx="1.2"/>
    <ellipse class="m1" cx="${toe}" cy="240" rx="11" ry="6"/>
    <rect class="cd" x="${bx - 1}" y="211" width="24" height="6" rx="3"/><path class="stitch" d="M${bx} 214 h22"/>
    <path class="stroke-m3" stroke-width="1.3" d="M${bx + 7} 220 l8 4 M${bx + 15} 220 l-8 4 M${bx + 7} 226 l8 4 M${bx + 15} 226 l-8 4 M${bx + 7} 232 l8 3 M${bx + 15} 232 l-8 3"/>
    <rect class="m2" x="${bx - 1}" y="241" width="24" height="4" rx="2"/>
    <path class="stroke-m3" stroke-width="1" d="M${bx + 2} 243 h2 M${bx + 7} 243 h2 M${bx + 12} 243 h2 M${bx + 17} 243 h2"/>
    <rect class="m3" x="${toe - 2}" y="241" width="6" height="4" rx="1"/>
   </g>
   <rect class="cd" x="${x - 1}" y="188" width="19" height="12" rx="6"/><rect class="shade" x="${x - 1}" y="196" width="19" height="4" rx="2"/>
   <path class="stroke-m1" stroke-width="1.5" d="M${x - 1} 193.5 h19"/><rect class="m3" x="${cx - 2}" y="191.5" width="4" height="4" rx="1"/>
  </g>`;
  };
  const tulaArm = (side) => {
    const l = side === 'l', x = l ? 68 : 116, cx = x + 8, fx = l ? 70.5 : 118.5, s = l ? 1 : -1;
    return { open: `
  <g class="arm-${side}" ${O(cx, 98)}>
   <rect class="c" x="${x}" y="94" width="16" height="30" rx="8"/>
   <rect class="hl" x="${x + 3}" y="98" width="2.4" height="18" rx="1.2"/>
   <path class="seam" d="M${x + 3} 108 q5 3 10 0 M${x + 3} 114 q5 3 10 0"/>
   ${l ? `<path class="m4" d="M${cx} 101 l4.5 7 h-9 z"/><path class="cd" d="M${cx - 2.5} 104.5 l2.5 -3.5 l2.5 3.5 z"/>` : ''}
   <g class="fore-${side}" ${O(cx, 124)}>
    <rect class="m4" x="${fx}" y="124" width="11" height="28" rx="5.5"/>
    <rect class="hl" x="${fx + 2.5}" y="128" width="2" height="18" rx="1"/>
    <path class="seam" d="M${fx} 138 h11"/>`, close: `
    <circle class="m4" cx="${cx}" cy="157.5" r="7.5"/>
    <rect class="m1" x="${cx - 7}" y="151" width="14" height="7" rx="3"/>
    <circle class="m4" cx="${cx + s * 6.5}" cy="154" r="3"/>
    <path class="seam" d="M${cx - 3} 163 v2.5 M${cx} 163.6 v2.5 M${cx + 3} 163 v2.5"/>
   </g>
   <rect class="cd" x="${x - 1}" y="119" width="18" height="8" rx="4"/><path class="seam" d="M${x} 123 h16"/>
   <rect class="cd" x="${x + 1}" y="93" width="14" height="5" rx="2.5"/><circle class="m3" cx="${cx}" cy="95.5" r="1.3"/>
  </g>` };
  };
  const tula = () => {
    const L = tulaArm('l'), R = tulaArm('r');
    return `
<svg class="robot r-tula c-peach" viewBox="0 0 200 260" data-mood="idle" role="img" aria-label="Tula, robot de Historias">
 <g class="body-all" ${O(100, 246)}>
  <g class="head" ${O(100, 88)}>
   <g class="sway" ${O(122, 42)}>
    <path class="stroke-cd" stroke-width="8" d="M120 38 C152 40 156 78 142 104"/>
    <path class="hl-s" d="M126 38 C146 42 150 70 142 92"/>
    <path class="stroke-m1" stroke-width="2" d="M134 44 l4 4 M144 56 l5 2 M148 70 l5 0 M146 86 l5 -2"/>
    <rect class="m3" x="117" y="34" width="7" height="9" rx="2"/>
    <circle class="bead" cx="141" cy="110" r="7"/><circle class="hl" cx="139" cy="108" r="2"/><circle class="m1" cx="141" cy="102" r="3"/>
   </g>
  </g>
  ${tulaLeg('l')}${tulaLeg('r')}
  <g class="torso" ${O(100, 164)}>
   <rect class="m4" x="64" y="130" width="9" height="16" rx="3"/><path class="stroke-m3" stroke-width="1" d="M66 134 h5 M66 137 h5"/>
   <path class="ribbon" d="M67.5 131 h3 v6 h-3 z"/>
   <rect class="a-butter-d" x="60" y="140" width="30" height="26" rx="6"/>
   <path class="stitch" d="M62.5 156 v7 h25 v-7"/>
   <path class="a-peach-d" d="M60 146 h30 v6 q-15 8 -30 0 z"/>
   <rect class="m4" x="72" y="150" width="6" height="7" rx="1.5"/><rect class="m1" x="74" y="152" width="2" height="3"/>
  </g>
  <g class="torso" ${O(100, 164)}>
   <rect class="cd" x="86" y="84" width="28" height="9" rx="4"/>
   <path class="c" d="M75 92 Q100 85 125 92 L129 162 Q100 168 71 162 Z"/>
   <path class="shade" d="M116 90 Q125 92 125 92 L129 162 Q122 164 116 165 Q123 130 116 90 Z"/>
   <path class="m4" d="M92 90 L100 110 L108 90 Z"/>
   <path class="cd" d="M92 90 L100 110 L89 122 L80 94 Z"/><path class="cd" d="M108 90 L100 110 L111 122 L120 94 Z"/>
   <path class="stitch" d="M82 96 L89 119 M118 96 L111 119"/>
   <path class="stroke-m1" stroke-width="2" d="M100 112 V160"/><path class="stroke-m3" stroke-width="1" d="M98.5 116 h3 M98.5 122 h3 M98.5 128 h3 M98.5 134 h3 M98.5 140 h3 M98.5 146 h3"/>
   <rect class="cd" x="81" y="128" width="13" height="10" rx="2"/><path class="stitch" d="M82.5 131 h10"/><circle class="m3" cx="87.5" cy="130.5" r="1.1"/>
   <rect class="cd" x="106" y="128" width="13" height="10" rx="2"/><path class="stitch" d="M107.5 131 h10"/><circle class="m3" cx="112.5" cy="130.5" r="1.1"/>
   <circle class="a-butter" cx="112.5" cy="145" r="6"/><circle class="stroke-m1" stroke-width="1" cx="112.5" cy="145" r="4.6"/><path class="m1" d="M112.5 140.5 l1.8 4.5 l-1.8 4.5 l-1.8 -4.5 z"/>
   <ellipse class="shine" cx="84" cy="100" rx="5" ry="2.5" transform="rotate(-30 84 100)"/>
   <path class="shade" d="M71 158 Q100 164 129 158 L129 162 Q100 168 71 162 Z"/>
   <rect class="m1" x="71" y="152" width="58" height="8"/><rect class="m2" x="78" y="151.5" width="3" height="9" rx="1"/><rect class="m2" x="119" y="151.5" width="3" height="9" rx="1"/>
   <rect class="a-butter" x="95" y="150.5" width="11" height="11" rx="2.5"/><rect class="m1" x="98" y="153.5" width="5" height="5" rx="1"/>
   <path class="stroke-m1" stroke-width="5" d="M116 92 L80 148"/>
   <circle class="stroke-m3" stroke-width="1.6" cx="104" cy="111" r="3"/><circle class="stroke-m3" stroke-width="1.6" cx="91" cy="131" r="2.6"/>
   <rect class="a-peach-d" x="105" y="96" width="9" height="8" rx="2" transform="rotate(-33 109.5 100)"/>
  </g>
  ${L.open}${L.close}
  ${R.open}
    <g class="lantern">
     <path class="stroke-m3" stroke-width="2.5" d="M116 168 q8 -12 16 0"/>
     <circle class="m3" cx="124" cy="160" r="2"/>
     <rect class="m1" x="113" y="166" width="22" height="6" rx="2"/><path class="hl-s" d="M115 167.5 h8"/>
     <rect class="glass" x="116" y="172" width="16" height="22" rx="5"/>
     <ellipse class="lglow" cx="124" cy="184" rx="9" ry="11"/>
     <ellipse class="lflame" cx="124" cy="185" rx="4" ry="6.5"/><ellipse class="lcore" cx="124" cy="187" rx="1.8" ry="3"/>
     <path class="stroke-m3" stroke-width="1.5" d="M120 172 v22 M128 172 v22"/>
     <rect class="m1" x="113" y="193" width="22" height="6" rx="2"/><rect class="m3" x="121" y="199" width="6" height="2.5" rx="1"/>
    </g>${R.close}
  <g class="head" ${O(100, 88)}>
   <rect class="m3" x="94" y="76" width="12" height="14" rx="3"/><rect class="m2" x="93" y="81" width="14" height="2.4" rx="1.2"/>
   <g class="wobble" ${O(64, 46)}><path class="stroke-m3" stroke-width="2.5" d="M64 46 L56 26"/><circle class="m3" cx="60.5" cy="36" r="1.6"/><circle class="bulb" cx="55" cy="23" r="4.5"/></g>
   <circle class="cd" cx="69" cy="54" r="10"/><circle class="m1" cx="69" cy="54" r="6"/><path class="stroke-m3" stroke-width="1" d="M65.5 52 h7 M65 54.5 h8 M65.5 57 h7"/>
   <circle class="cd" cx="131" cy="54" r="10"/><circle class="m1" cx="131" cy="54" r="6"/><circle class="m3" cx="131" cy="54" r="2.2"/>
   <rect class="c" x="70" y="18" width="60" height="66" rx="28"/>
   <path class="shade" d="M121 22 q9 8 9 28 v6 q0 22 -22 28 h-4 q22 -8 22 -42 q0 -12 -5 -20 z"/>
   <path class="seam" d="M72 42 Q76 36 78 36 M128 42 Q124 36 122 36"/>
   <ellipse class="shine" cx="86" cy="22" rx="9" ry="3" transform="rotate(-15 86 22)"/>
   <rect class="m4" x="76" y="36" width="48" height="42" rx="20"/>
   <path class="shade" d="M116 38 q8 4 8 18 v2 q0 18 -18 20 h-2 q16 -4 16 -24 q0 -10 -4 -16 z" opacity=".5"/>
   <g class="eyes" ${O(100, 56)}>
    <g class="f-idle"><ellipse class="inkf blink" cx="89" cy="55" rx="4.5" ry="6"/><ellipse class="inkf blink" cx="111" cy="55" rx="4.5" ry="6"/><circle class="m4" cx="90.6" cy="52.6" r="1.6"/><circle class="m4" cx="112.6" cy="52.6" r="1.6"/><circle class="m4" cx="87.8" cy="57.6" r=".7"/><circle class="m4" cx="109.8" cy="57.6" r=".7"/><path class="ink-s lash-i" d="M84.2 50.5 l-3 -2 M115.8 50.5 l3 -2"/><path class="ink-s brow-i" d="M84 45 q5 -2.4 10 0 M106 45 q5 -2.4 10 0"/><path class="ink-s" style="stroke-width:2.4" d="M95 69 q5 4 10 0"/><ellipse class="cheek soft" cx="83" cy="65" rx="4" ry="2.4"/><ellipse class="cheek soft" cx="117" cy="65" rx="4" ry="2.4"/></g>
    <g class="f-happy"><path class="ink-s" d="M83 57 q6 -8 12 0 M105 57 q6 -8 12 0"/><path class="ink-s lash-i" d="M83.6 54.5 l-3 -2 M116.4 54.5 l3 -2"/><path class="ink-s brow-i" d="M84 43 q5 -3 10 0 M106 43 q5 -3 10 0"/><path class="inkf" d="M93 66 q7 8 14 0 Z"/><path class="tongue" d="M97 69.5 q3 2.4 6 0 q-3 -1.6 -6 0z"/><ellipse class="cheek" cx="83" cy="64" rx="4.4" ry="2.6"/><ellipse class="cheek" cx="117" cy="64" rx="4.4" ry="2.6"/></g>
    <g class="f-party"><polygon class="a-butter" stroke="var(--ink)" stroke-width="1.5" points="${star(89, 55, 7)}"/><polygon class="a-butter" stroke="var(--ink)" stroke-width="1.5" points="${star(111, 55, 7)}"/><path class="ink-s brow-i" d="M83 42 q6 -4 12 0 M105 42 q6 -4 12 0"/><path class="inkf" d="M92 65 q8 11 16 0 Z"/><path class="tongue" d="M96.5 70 q3.5 2.6 7 0 q-3.5 -2 -7 0z"/><ellipse class="cheek" cx="82" cy="64" rx="4.4" ry="2.6"/><ellipse class="cheek" cx="118" cy="64" rx="4.4" ry="2.6"/></g>
    <g class="f-think"><ellipse class="inkf" cx="86" cy="51" rx="4" ry="5.5"/><ellipse class="inkf" cx="108" cy="51" rx="4" ry="5.5"/><circle class="m4" cx="87.2" cy="49" r="1.3"/><circle class="m4" cx="109.2" cy="49" r="1.3"/><path class="ink-s brow-i" d="M80 42.5 l10 -2.5 M103 44 h10"/><path class="ink-s" style="stroke-width:2.4" d="M99 69.5 q3 -1.6 6 0"/><ellipse class="cheek soft" cx="117" cy="65" rx="4" ry="2.4"/></g>
    <g class="f-sad"><ellipse class="inkf" cx="89" cy="58" rx="4" ry="4.5"/><ellipse class="inkf" cx="111" cy="58" rx="4" ry="4.5"/><circle class="m4" cx="90.2" cy="56.5" r="1.2"/><circle class="m4" cx="112.2" cy="56.5" r="1.2"/><path class="ink-s brow-i" d="M83 50 l10 -3.5 M117 50 l-10 -3.5"/><path class="ink-s" style="stroke-width:2.4" d="M95 72 q5 -4 10 0"/><circle class="tear" cx="86" cy="64" r="1.8"/></g>
    <g class="f-sleep"><path class="ink-s" d="M83 56 q6 4 12 0 M105 56 q6 4 12 0"/><path class="ink-s lash-i" d="M83.4 57.5 l-3 2 M116.6 57.5 l3 2"/><path class="ink-s brow-i" d="M84 47.5 q5 1 10 0 M106 47.5 q5 1 10 0"/><ellipse class="inkf snore" cx="100" cy="70" rx="2" ry="2"/><ellipse class="cheek soft" cx="83" cy="65" rx="4" ry="2.4"/><ellipse class="cheek soft" cx="117" cy="65" rx="4" ry="2.4"/></g>
   </g>
   <circle class="freckle" cx="82" cy="62" r="1.1"/><circle class="freckle" cx="85.5" cy="64" r="1.1"/><circle class="freckle" cx="81.5" cy="66" r=".9"/><circle class="freckle" cx="114.5" cy="64" r="1.1"/><circle class="freckle" cx="118" cy="62" r="1.1"/><circle class="freckle" cx="118.5" cy="66" r=".9"/>
   <rect class="m1" x="68" y="25" width="64" height="7" rx="3.5"/><rect class="m3" x="66" y="25" width="6" height="7" rx="1.5"/><rect class="m3" x="128" y="25" width="6" height="7" rx="1.5"/>
   <circle class="m3" cx="88" cy="28" r="10.5"/><circle class="m3" cx="112" cy="28" r="10.5"/>
   <circle class="lens" cx="88" cy="28" r="8.5"/><circle class="lens" cx="112" cy="28" r="8.5"/>
   <path class="glare" d="M83 25 q3 -3 6 -3 M107 25 q3 -3 6 -3"/><circle class="hl" cx="92" cy="31" r="1.2"/><circle class="hl" cx="116" cy="31" r="1.2"/>
   <rect class="m1" x="98" y="26" width="4" height="4" rx="1"/>
   <text class="zz" x="134" y="26">z</text><text class="zz" x="142" y="14">z</text>
  </g>
 </g>
</svg>`;
  };

