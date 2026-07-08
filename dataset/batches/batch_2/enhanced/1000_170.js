setcpm(105/4)

$: s("bd*2 sd").slow(2).bank("RolandTR909").gain(.8)

$: s("perc*3").fast(2).gain(.3)

$: s("gm_pad_warm").note("c3 g3").fast(2).room(.4).gain(.3)

$: note("c2 g2 c2 g2").s("sawtooth").lpf(700).gain(.4)
