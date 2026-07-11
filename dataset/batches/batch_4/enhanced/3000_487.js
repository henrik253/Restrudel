setcpm(110/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: s("hh*8").gain(.2).room(.3)

$: n("2 ~ 2 ~").scale("c2:minor").s("sawtooth").lpf(500).gain(.5).release(.15)

$: n("2*8 3 4 3 3 3 4 3 3 3 4 3").scale("c2:minor").transpose(12).s("square").lpf(1800).resonance(4).gain(.4).release(.2)

$: n("0").scale("c2:minor").s("sine").lpf(1200).room(.6).gain(.12).release(.4)

