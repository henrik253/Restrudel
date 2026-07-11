setcpm(110/4)

$: s("oh").gain(.75).room(.2)

$: n("[0.8 0.9 0.7 0.9]*2").scale("c2:minor").s("sawtooth").lpf(500).gain(.5).release(.15)

$: n("[0.8 0.9 0.7 0.9]*2").scale("c2:minor").transpose(12).s("square").lpf(1800).gain(.35).release(.2)
