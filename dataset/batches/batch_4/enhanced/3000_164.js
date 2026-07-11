setcpm(110/4)

$: s("cowbell").gain(.75).room(.2)

$: n("7 11!2 6 7").scale("c2:minor").s("sawtooth").lpf(500).gain(.5).release(.15)

$: n("g5 c5").scale("c2:minor").s("square").lpf(1800).resonance(4).gain(.4).release(.2)
