setcpm(110/4)

$: s("crow ~ cowbell").gain(.75).room(.2)

$: s("hh*8").gain(.2).room(.3)

$: n("a#5 g#5 e5 c#5").scale("c2:minor").s("sawtooth").lpf(500).gain(.5).release(.15)

$: n("a#5 g#5 e5 c#5").scale("c2:minor").transpose(12).s("square").lpf(1800).gain(.35).release(.2)
