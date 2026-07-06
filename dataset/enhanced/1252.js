setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.18)

$: n("<0 2 4 5>").scale("d:minor").s("gm_drawbar_organ").lpf(2500).release(.4).room(.4).gain(.35)

$: note("d2 d2 d2 d2 a2 a2 d2 e2").s("sawtooth").lpf(700).release(.2).gain(.5)
