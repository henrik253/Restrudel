setcpm(122/4)

$: s("bd ~ snare ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.18).pan(.5)

$: note("g2 f2 a2 c3 f3").s("supersaw").lpf(3390).resonance(5).release(.25).room(.3).gain(.4)

$: note("<g1 c2 f1 a1>").s("sawtooth").lpf(600).release(.3).gain(.5)
