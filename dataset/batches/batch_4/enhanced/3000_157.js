setcpm(110/4)

$: s("bongo").gain(.75).room(.2)

$: n("e1 ~").scale("c2:minor").s("sawtooth").lpf(500).gain(.5).release(.15)

$: n("a2*8 a2*4 ~ ~").scale("c2:minor").s("square").lpf(1800).resonance(4).gain(.4).release(.2)
