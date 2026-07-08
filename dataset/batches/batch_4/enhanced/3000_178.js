setcpm(110/4)

$: s("bd").gain(.75).room(.2)

$: n("d#5@2 ~ a4 d#5@3").scale("c2:minor").s("sawtooth").lpf(500).gain(.5).release(.15)

$: n("[1 0.7 0.5 0.3]*2").scale("c2:minor").s("square").lpf(1800).resonance(4).gain(.4).release(.2)
