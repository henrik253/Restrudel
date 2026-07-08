setcpm(110/4)

$: s("bd ~ bd ~").bank("RolandTR909").gain(.8)

$: n("~ ~ 2 11 9 10").scale("c2:minor").s("sawtooth").lpf(500).gain(.5).release(.15)

$: n("~ ~ 2 11 9 10").scale("c2:minor").transpose(12).s("square").lpf(1800).gain(.35).release(.2)
