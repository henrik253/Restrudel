setcpm(110/4)

$: s("bd ~ sd ~").bank("LinnDrum").gain(.8)

$: s("hh*8").bank("LinnDrum").gain(.2)

$: n("0 ~ 4 2 ~ 5 4 ~").scale("e:minor").s("bell").clip(2).cutoff(800).resonance(2).gain(.3).room(.4)

$: s("east:2 ~ east:4 ~").slow(2).gain(.3)

$: note("e2 ~ e2 g2 ~ e2 d2 ~").s("square").lpf(550).release(.15).gain(.45)
