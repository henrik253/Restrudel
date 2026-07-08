setcpm(122/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("shaker_small:0*4").gain(.2)

$: s("hh*8").gain(.16)

$: note("a3 c5 c#5 d#5 d5 a4 d5 c#5 c5 a4 d#4 d4 a3 c4 e4 ~").s("sawtooth").lpf(2600).resonance(6).release(.2).delay(.3).room(.3).gain(.35)

$: note("g1 ~ a1 ~ c2 ~ a1 ~").s("square").lpf(650).release(.25).gain(.5)
