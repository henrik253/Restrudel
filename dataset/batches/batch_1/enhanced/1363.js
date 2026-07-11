setcpm(108/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("linndrum_oh bongo*2 ~").clip(1).gain(.3).release(.13).attack(.05)

$: note("D2 A2 G2 F2").s("sawtooth").lpf(600).release(.2).gain(.4)

$: s("gm_overdriven_guitar:6 ~").note("<d3 bb2>").lpf(1600).room(.4).gain(.4)

$: note("d4 f4 a4 g4").s("gm_choir_aahs:0").lpf(2000).room(.6).gain(.3)
