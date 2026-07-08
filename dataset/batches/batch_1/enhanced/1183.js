setcpm(122/4)

$: s("bd ~ snare ~").bank("RolandTR909").gain(.5).room(.4)

$: s("~ bd*2 ~ ~").bank("RolandTR909").lpf(2939).gain(.5)

$: n("0 3 5 7 5 3 0 -3").scale("a:minor").s("sawtooth").lpf(1289).resonance(6).release(.2).room(.3).delay(.3).gain(.4)

$: n("<a1 e2 c2 g1>").scale("a:minor").s("square").lpf(600).release(.3).gain(.5)
