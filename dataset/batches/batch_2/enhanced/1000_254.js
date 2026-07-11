setcpm(118/4)
$: s("snare ~ snare ~").sound("drums").lpf(3000).room(.5).gain(.6)
$: note("d5 e5").lpf(3500).room(.5).gain(.35)
$: note("g3 bb3 d4 f4 c4 e4 g4 bb4").s("sawtooth").lpf(1200).gain(.3).release(.3)
