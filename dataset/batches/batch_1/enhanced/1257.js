setcpm(130/4)

$: s("bd*2 ~ sd ~").bank("RolandTR909").gain(.85)

$: s("rd*3 ~").gain(.2)

$: s("hh*8").gain(.18)

$: note("d5 e5 e5 ~ g5 e5 d5 ~").s("square").lpf(3100).resonance(6).release(.2).delay(.4).gain(.4)

$: note("a2*8").s("sawtooth").decay(.18).sustain(.25).release(.2).delay(.3).lpf(800).gain(.4)
