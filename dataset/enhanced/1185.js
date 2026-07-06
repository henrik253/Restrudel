setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.18).pan(.5)

$: n("7 ~ 11 8 ~ ~ 9 7").scale("a3:minor").transpose("<0 -5>/4").s("sawtooth").lpf(2400).resonance(6).release(.2).delay(.3).gain(.4)

$: n("<0 -5>/2").scale("a2:minor").s("square").lpf(600).release(.3).gain(.5)
