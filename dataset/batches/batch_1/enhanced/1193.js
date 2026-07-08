setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.18).pan(.5)

$: note("c2*8").s("sawtooth").lpf(700).release(.15).gain(.5)

$: note("c4*2 c4 a#3").s("square").lpf(2000).resonance(6).release(.3).room(.3).delay(.3).gain(.4)

$: note("<c5 g4 a#4 f4>").s("gm_electric_bass_finger:2").lpf(2200).release(.4).gain(.35)
