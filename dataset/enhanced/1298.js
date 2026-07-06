setcpm(124/4)

$: s("bd ~ bd ~").bank("RolandTR909").gain(.85)

$: s("~ cr ~ ~").bank("RolandTR909").gain(.4)

$: s("hh*8").gain(.16)

$: n("<0 3 5 7>").scale("c:minor").s("gm_vibraphone:3").struct("<x*2 x>").lpf(2500).release(.3).room(.4).gain(.35)

$: n("<c2 c2 g1 eb2>").scale("c:minor").s("sawtooth").lpf(700).release(.25).gain(.45)
