setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ cr ~ ~").bank("RolandTR909").gain(.4)

$: s("hh*8").gain(.16)

$: note("~ a2*8").s("sawtooth").clip(2).release(.2).lpf(1200).gain(.5)

$: note("a1 e2 a1 c2").s("square").lpf(650).release(.25).gain(.45)
