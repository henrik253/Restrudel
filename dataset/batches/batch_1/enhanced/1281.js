setcpm(122/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.18)

$: note("a2*8").s("piano").lpf(1800).gain(.4)

$: n("0 3 7 5 7 3 0 ~").scale("c:minor").s("gm_lead_2_sawtooth").lpf(3000).release(.15).delay(.3).gain(.35)

$: n("<c2 c2 g1 eb2>").scale("c:minor").s("clavisynth").lpf(650).release(.2).gain(.45)
