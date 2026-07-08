setcpm(110/4)

$: s("hh").gain(.75).room(.2)

$: s("hh*8").gain(.2).room(.3)

$: n("3 2!3 4 3@3 4 3 4 5 6@3").scale("c2:minor").s("sawtooth").lpf(500).gain(.5).release(.15)

$: n("3 2!3 4 3@3 4 3 4 5 ").scale("c2:minor").transpose(12).s("square").lpf(1800).gain(.35).release(.2)
