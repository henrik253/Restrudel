setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: s("hh*8").lpf(4000).pan("0.2 -0.2").gain(.2)

$: n("~ 8").scale("ab:major").s("square").gain(.4)
