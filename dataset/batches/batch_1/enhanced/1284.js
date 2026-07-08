setcpm(126/4)

$: s("bd*2 ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.18)

$: s("woodblock:1 ~ woodblock:2 woodblock:2").gain(.3)

$: note("b4 f#5 b4 f#5").s("sawtooth").lpf(2600).resonance(6).release(.2).delay(.4).gain(.35)

$: note("<b1 b1 f#1 e2>").s("square").lpf(650).release(.25).gain(.5)
