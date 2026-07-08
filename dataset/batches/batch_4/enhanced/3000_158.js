setcpm(110/4)

$: s("hh").gain(.75).room(.2)

$: n("[1 0.5]*4").scale("c2:minor").s("sawtooth").lpf(500).gain(.5).release(.15)

$: n("[1 0.5]*4").scale("c2:minor").transpose(12).s("square").lpf(1800).gain(.35).release(.2)

$: n("0").scale("c2:minor").s("sine").lpf(1200).room(.6).gain(.12).release(.4)
