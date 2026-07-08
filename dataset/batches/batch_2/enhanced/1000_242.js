setcpm(96/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: note("b2 d2 g2").s("sawtooth").lpf(900).gain(.4)

$: s("hh*3 ~ perc").slow(2).gain(.25)

$: s("pulse").n("0 2 4").gain(.3)
