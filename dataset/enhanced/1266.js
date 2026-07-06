setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.18)

$: n("<0 2 4 5>").scale("c:major").s("gm_drawbar_organ").delay(.5).delayfeedback(.4).orbit(2).lpf(2500).release(.4).gain(.35)

$: n("0 2 4 2 5 4 2 0").scale("c:major").s("gm_flute:1").lpf(3000).release(.2).room(.3).gain(.3)

$: n("<c2 c2 g1 a1>").scale("c:major").s("sawtooth").lpf(650).release(.25).gain(.5)
