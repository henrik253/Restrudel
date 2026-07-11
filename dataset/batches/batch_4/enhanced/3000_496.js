setcpm(110/4)

$: s("bd lt").gain(.75).room(.2)

$: s("hh*8").gain(.2).room(.3)

$: n("4 4 4 4 4 4").scale("c2:minor").s("sawtooth").lpf(500).gain(.5).release(.15)

$: n("6 6 5 ~ 88 6 6 5 ~ 88 6 6 5").scale("c2:minor").transpose(12).s("square").lpf(1800).resonance(4).gain(.4).release(.2)

$: n("0").scale("c2:minor").s("sine").lpf(1200).room(.6).gain(.12).release(.4)

