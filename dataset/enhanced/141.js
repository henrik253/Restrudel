setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ hh ~ ht").bank("RolandTR909").gain(.4)

$: s("hh*8").gain("[.2 .13]*4").pan(.5)

$: note("c3 d3 c3 d3").s("sawtooth").lpf(2027).release(.2).delay(.3).gain(.4)

$: note("<c2 g1 a1 f1>").s("square").lpf(600).release(.25).gain(.5)
