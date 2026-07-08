setcpm(122/4)

$: s("bd ~ sd hh*4").bank("RolandTR909").gain(.4).room(.2).delay(.3)

$: s("hh*8").gain(.15).pan(.5)

$: note("c5 eb5 g5 f5 eb5 c5").s("gm_ocarina").lpf(3000).release(.3).room(.3).delay(.3).gain(.4)

$: note("<c2 g1 ab1 bb1>").s("sawtooth").lpf(600).release(.3).gain(.5)
