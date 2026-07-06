setcpm(114/4)

$: s("bd ~ snare ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.18).pan(.5)

$: note("g#4@2 ~ f#4 f#4@2").s("square").lpf(573).room(.5).delay(.4).release(.25).gain(.4)

$: note("a3 f3 c4 g3 a3 f3 c4 g3").s("sawtooth").lpf(2200).resonance(5).release(.4).attack(.06).gain(.4)

$: note("<a1 f1 c2 g1>").s("gm_electric_bass_finger:2").lpf(700).release(.3).gain(.5)
