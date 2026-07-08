setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.18)

$: s("~ sd hh sd").bank("RolandTR909").gain(.4)

$: n("7 5 3 7 5 3 0 ~").scale("c:minor").s("sawtooth").lpf(2500).resonance(6).release(.2).delay(.4).gain(.35)

$: n("<c2 c2 g1 eb2>").scale("c:minor").s("square").lpf(650).release(.25).gain(.5)
