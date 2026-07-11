setcpm(110/4)

$: s("hh*16 hh*16").gain(.75).room(.2)

$: s("hh*8").gain(.2).room(.3)

$: n("0 ~ 3 ~").scale("c2:minor").s("sawtooth").lpf(500).gain(.5).release(.15)

$: n("4 5 7 5 4 2 0 ~").scale("c2:minor").s("square").lpf(1800).resonance(4).gain(.4).release(.2)

