setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.18).pan(.5)

$: note("c3 ~ eb3 ~").s("sawtooth").lpf(1939).release(.25).gain(.5)

$: note("<c3 eb3 g3 bb3>").s("square").lpf(2200).resonance(6).release(.3).room(.3).delay(.3).gain(.4)
