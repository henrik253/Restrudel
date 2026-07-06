setcpm(110/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("~ hh ~ hh").gain(.18)

$: note("a1 f1 c2 g1 ~ d#4 f4@2 g4").s("triangle").lpf(800).release(.25).gain(.4)

$: n("0 3 5 7 5 3").scale("a:minor").s("gm_epiano1:1").lpf(1400).room(.4).gain(.4)

$: note("a2*8 ~").s("sawtooth").lpf(600).release(.15).add("<0@2 [0,-2]@2>").gain(.35)
