setcpm(118/4)

$: s("bd ~ bd sd").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.18).pan(.4)

$: note("c4 eb4 g4 eb4").s("sine").lpf(3000).release(.3).room(.2).gain(.4)

$: s("pad ~ ~ ~").lpf(2200).room(.3).delay(.3).gain(.4)

$: note("<c2 g1 ab1 f1>").s("sawtooth").lpf(600).release(.25).gain(.5)
