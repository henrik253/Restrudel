setcpm(110/4)

$: s("bd ~ sd").gain(.75).room(.2)

$: n("B2 F#2 F2 Bb2").scale("c2:minor").s("sawtooth").lpf(500).gain(.5).release(.15)

$: n("a1 g1*2 a1*2").scale("c2:minor").s("square").lpf(1800).resonance(4).gain(.4).release(.2)
