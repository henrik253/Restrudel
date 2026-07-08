setcpm(100/4)

$: s("oh ~ bd").gain(.75).room(.2)

$: n("e4 g4 g3 b3 d4 a3 c4 e4 f3 a3 ").scale("c2:minor").s("sawtooth").lpf(500).gain(.5).release(.15)

$: n("e4 g4 g3 b3 d4 a3 c4").scale("c2:minor").transpose(12).s("square").lpf(1800).gain(.35).release(.2)
