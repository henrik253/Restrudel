setcpm(124/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.18)

$: note("c4 c4 a4@3 ~").s("sawtooth").lpf(1200).release(.2).room(.3).gain(.4)

$: n("c2 ~ f2 ~ ~ 2 11 9 10 8").scale("c:minor").s("sawtooth").lpf(600).release(.15).gain(.4)
