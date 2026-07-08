setcpm(110/4)

$: s("rim").gain(.75).room(.2)

$: n("0 3").scale("D1:hirajoshi").s("sawtooth").lpf(500).gain(.5).release(.15)

$: n("0 3").scale("D1:hirajoshi").transpose(12).s("square").lpf(1800).gain(.35).release(.2)
