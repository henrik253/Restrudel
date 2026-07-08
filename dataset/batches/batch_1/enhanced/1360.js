setcpm(115/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("hh*8").gain(.16)

$: note("a2*8 a2*4 ~ ~").s("triangle").lpf(700).release(.15).gain(.4)

$: note("f4 a3 c4 f4").s("sawtooth").lpf(1500).release(.25).room(.3).gain(.35)
