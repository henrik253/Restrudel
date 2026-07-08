setcpm(110/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: s("hh*8").gain(.2).room(.3)

$: n("4 4 4 4 4 5 3 3 4 4 3 4 4 4 3 3 4 4 4 4 4 5 3 3 4 4 3 4").scale("C:ritusen").s("sawtooth").lpf(500).gain(.5).release(.15)

$: n("5 5 5 5").scale("C:ritusen").transpose(12).s("square").lpf(1800).resonance(4).gain(.4).release(.2)

$: n("0").scale("C:ritusen").s("sine").lpf(1200).room(.6).gain(.12).release(.4)

