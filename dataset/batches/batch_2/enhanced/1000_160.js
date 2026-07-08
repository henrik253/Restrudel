setcpm(120/4)

$: s("kick*4 linndrum_sd").bank("RolandTR909").velocity(.4).gain(.8)

$: s("linndrum_hh*8").gain(.2).release(.1)

$: n("0 2 4 2").scale("Bb2:major").s("sawtooth").lpf(900).release(.2).gain(.4)
