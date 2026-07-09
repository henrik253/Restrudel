setcpm(110/4)

$: s("lt").gain(.75).room(.2)

$: n("c3 g2 a2 f2 c3 g2 c2 f2").scale("c2:minor").s("sawtooth").lpf(500).gain(.5).release(.15)

$: n("c3 g2 a2 f2 c3 g2 c2").scale("c2:minor").transpose(12).s("square").lpf(1800).gain(.35).release(.2)

$: n("0").scale("c2:minor").s("sine").lpf(1200).room(.6).gain(.12).release(.4)
