setcpm(120/4)

$: s("bd:1 ~ sd:1 ~").gain(.8)

$: s("hh*8").bank("RolandTR909").gain(.25)

$: n("0 ~ 5 ~").scale("c3:major").s("sawtooth").gain(.4).lpf(800).release(.1)

