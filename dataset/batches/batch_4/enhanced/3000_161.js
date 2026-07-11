setcpm(110/4)

$: s("cp").gain(.75).room(.2)

$: n("b4 eb4 g4 bb4").scale("c2:minor").s("sawtooth").lpf(500).gain(.5).release(.15)

$: n("4 ~ 3 4 ~ 3").scale("c2:minor").s("square").lpf(1800).resonance(4).gain(.4).release(.2)
