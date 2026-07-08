setcpm(140/4)

$: s("bd*2 ~ sd ~").bank("RolandTR808").gain(.85)

$: s("linndrum_hh*8").gain(.2)

$: note("a2*4 a2*4").sound("sawtooth").lpf(700).gain(.4)

$: note("a3 c4 e4 g3").sound("lead").room(.3).gain(.3)
