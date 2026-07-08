setcpm(115/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("perc*3 ~ woodblock:2 woodblock:2").gain(.25)

$: s("hh*8").gain(.16)

$: note("f4 a4 f4 a4").s("sawtooth").lpf(2200).resonance(6).release(.2).room(.4).delay(.4).delaytime(".33 .166").gain(.35)

$: note("<f1 f1 c2 a1>").s("square").lpf(650).release(.25).gain(.5)
