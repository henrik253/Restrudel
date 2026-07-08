setcpm(138/4)

$: s("bd*4").bank("RolandTR909").gain(.85)

$: note("g1 [~ g1] bb1 g1 [~ g2] g1 f1 [~ g1]").s("sawtooth").cutoff("<600 975 1400 800>").resonance(20).release(.1).gain(.4)

$: s("shaker_small:3*8").gain(.2)

$: s("~ ~ cowbell ~").gain(.25)
