setcpm(110/4)

$: s("bd ~ sd").gain(.75).room(.2)

$: n("e1 ~ ~ e2").scale("c2:minor").s("sawtooth").lpf(500).gain(.5).release(.15)

$: n("e1 ~ ~ e2").scale("c2:minor").transpose(12).s("square").lpf(1800).gain(.35).release(.2)
