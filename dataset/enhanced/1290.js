setcpm(128/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*4 ~ sd bd").bank("RolandTR909").clip(.85).release(.1).gain(.5)

$: s("hh*8").gain(.16)

$: note("c5 ~ e5 ~ g5 ~ e5 ~").s("square").lpf(4000).resonance(6).release(.2).room(.2).gain(.35)

$: note("c2 c2 c2 c2 g1 g1 c2 e2").s("gm_electric_bass_finger").lpf(1041).release(.25).gain(.45)
