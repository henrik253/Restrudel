setcpm(110/4)

$: s("cp").gain(.75).room(.2)

$: n("c a f e").scale("c2:minor").s("sawtooth").lpf(500).gain(.5).release(.15)

$: n("c a f e").scale("c2:minor").transpose(12).s("square").lpf(1800).gain(.35).release(.2)
