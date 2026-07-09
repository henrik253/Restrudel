setcpm(75/4)

$: s("bd ~ bd ~").bank("RolandTR909").gain(.8)

$: n("0 7 -4 -4 b -2 7 4 b 3 1 2 1 0").scale("c2:minor").s("sawtooth").lpf(500).gain(.5).release(.15)

$: n("0 7 -4 -4 b -2 7 4 b").scale("c2:minor").transpose(12).s("square").lpf(1800).gain(.35).release(.2)

$: n("0").scale("c2:minor").s("sine").lpf(1200).room(.6).gain(.12).release(.4)
