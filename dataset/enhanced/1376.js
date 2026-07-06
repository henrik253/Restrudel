setcpm(112/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("hh*16").gain("[.2 .12]*4")

$: note("a#4@2 ~ d4 ~ ~ c4 ~ e4 a4").s("sawtooth").lpf(1026).release(.25).room(.3).gain(.4)

$: note("a2 ~ f2 ~").s("square").lpf(500).release(.2).gain(.4)
