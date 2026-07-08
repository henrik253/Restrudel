setcpm(95/4)

$: s("bd*4").slow(2).bank("RolandTR909").gain(.8)

$: s("hh*8").gain(.2)

$: s("gm_pad_warm").slow(2).lpf(2000).room(.5).gain(.3)

$: n("0 3 7 10").scale("C:major").s("sawtooth").lpf(1600).gain(.35)
