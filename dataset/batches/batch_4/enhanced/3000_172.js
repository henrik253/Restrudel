setcpm(90/4)

$: s("clave ~ bd").gain(.75).room(.2)

$: n("e5 a5").scale("c2:minor").s("sawtooth").lpf(500).gain(.5).release(.15)

$: n("e5 a5").scale("c2:minor").transpose(12).s("square").lpf(1800).gain(.35).release(.2)
