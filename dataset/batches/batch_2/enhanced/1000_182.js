setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: s("hh*8").gain(.25).cutoff(4000).resonance(4)

$: note("a5 e5 c5 f5 a5 f5 a5 f5 ~ a5 ~ f5 ~ d5 ~ e5").sound("square").lpf(1800).gain(.35)

$: s("bd!2 ~").slow(2).lpf(800).gain(.6).room(.1)
