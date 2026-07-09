setcpm(30/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: s("hh*8").bank("RolandTR909").gain(.25)


$: n("0 3 7 5").scale("c4:major").s("square").gain(.3).lpf(2000).resonance(1).release(.2)
