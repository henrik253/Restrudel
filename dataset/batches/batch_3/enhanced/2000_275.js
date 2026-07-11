setcpm(108/4)

$: s("bd*2 sd~2").bank("RolandTR909").gain(.75).release(.08)

$: s("hh*8").gain(.22)

$: n("0 5 3 7").scale("c4:minor").s("sawtooth").lpf(3500).gain(.4).release(.12)

$: n("0 2 4 3").scale("c4:minor").s("square").lpf(5000).gain(.3).release(.2)
