setcpm(122/4)

$: s("bd ~ sd ~").bank("LinnDrum").gain(.85)

$: s("linndrum_oh lt*2 ~ cr").gain(.4).release(.1)

$: n("2 1 5 8 7 9!2 7 8 5 1 2 4 ~ 5!2 4").scale("a:minor").s("sawtooth").room(.4).lpf(1600).release(.2).gain(.4)

$: n("2 0 4 5 4 3 2 0").scale("a:minor").s("square").lpf(600).release(.2).gain(.4)
