setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.18)

$: n("<0 4 7 5>").scale("c:major").s("gm_piano").lpf(2500).release(.3).room(.3).gain(.35)

$: n("0 2 4 5 4 2 0 ~").scale("c:major").s("sawtooth").lpf(2200).resonance(6).release(.2).delay(.4).gain(.35)

$: n("<c2 c2 g1 a1>").scale("c:major").s("square").lpf(600).release(.25).gain(.5)
