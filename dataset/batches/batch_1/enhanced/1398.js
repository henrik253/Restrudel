setcpm(114/4)

$: note("f3 a3 c4 f4 c4 e4 g4 c5").s("sawtooth").lpf(2000).release(.15).delay(.3).gain(.35)

$: s("bd ~ sd ~ ~ bd sd ~").bank("RolandTR909").gain(.8)

$: s("rd ~ rd rd rd ~ rd ~").gain(.2)

$: s("hh*2 hh hh*2 hh").gain(.15)

$: note("f1 ~ ~ f1 ~ ~ c2 ~").s("square").lpf(450).release(.2).gain(.5)
