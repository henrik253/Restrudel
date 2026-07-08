setcpm(130/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: s("hh*8").gain(.2)

$: n("0 2 4 0 2 4 ~ -1").scale("C:bebopMajor").s("square").speed(1.2).lpf(2000).gain(.35)

$: note("c5 d5 e5 e5 ~ ~ ~ ~").sound("supersaw").lpf(1200).gain(.2)
