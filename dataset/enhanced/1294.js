setcpm(126/4)

$: s("bd*4").bank("RolandTR909").gain(.85)

$: s("~ sd ~ sd").bank("RolandTR909").gain(.5)

$: s("bd*4").bank("RolandTR909").gain(.3)

$: note("c4 e4 g4 e4 c5 g4 e4 c4").s("supersaw").cutoff(2500).resonance(10).release(.2).room(.5).gain(.3)

$: note("<c2 c2 g1 a1>").s("sawtooth").lpf(391).resonance(10).release(.25).gain(.45)
