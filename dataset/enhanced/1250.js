setcpm(120/4)

$: s("bd*2 ~ bd ~").bank("RolandTR909").gain(.85)

$: s("~ hh hh*2 sd").bank("RolandTR909").gain(.5)

$: s("hh*8").gain(.18)

$: n("<0 3 5 7>").scale("c:minor").s("piano").lpf(1800).release(.3).room(.3).gain(.4)

$: n("<c2 c2 g1 eb2>").scale("c:minor").s("sawtooth").lpf(700).release(.25).gain(.5)
