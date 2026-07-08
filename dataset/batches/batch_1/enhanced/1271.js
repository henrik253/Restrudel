setcpm(124/4)

$: s("bd*2 ~ bd ~").bank("RolandTR909").gain(.85)

$: s("~ oh ~ oh").gain(.18)

$: s("hh*8").gain(.16)

$: n("0 3 7 5 7 3 0 ~").scale("c:minor").s("supersaw").lpf(3500).resonance(6).release(.2).room(.2).delay(.3).gain(.35)

$: n("<c2 c2 g1 eb2>").scale("c:minor").s("gm_electric_guitar_clean:2").lpf(700).release(.25).gain(.4)
