setcpm(126/4)

$: s("bd*4").bank("RolandTR909").gain(.85)

$: s("~ sd ~ sd").bank("RolandTR909").gain(.5)

$: s("cp*8").gain(.15).room(.4)

$: note("c5 a4 g4 a4").s("piano").lpf(3500).room(.3).gain(.35)

$: note("~ g3 ~ b3 ~ a3 c4 ~").s("sine").lpf(3000).pan(.6).gain(.35)

$: note("<c2 c2 g1 a1>").s("sawtooth").lpf(700).release(.25).gain(.5)
