setcpm(122/4)

$: s("bd*4 ~").lpf(700).gain(.8)

$: s("~ sd ~ sd").bank("RolandTR909").gain(.5)

$: s("hh*8").gain(.16)

$: note("a2 a3 a2 f2 c3 g2 d#2 f2@3").s("sawtooth").lpf(600).room(.4).release(.2).gain(.4)

$: note("c4*2 c4").s("square").lpf(1600).room(.4).release(.2).gain(.35)
