setcpm(125/4)

$: s("bd ~ bd ~").bank("RolandTR909").gain(.8)

$: s("hh*2 cp hh*2 cp").gain(".2 .55 .2 .55")

$: s("cymbal ~ ~ ~").slow(2).gain(.3).room(.6)

$: note("f2 ~ f2 ab2 ~ f2 c3 ~").s("square").lpf(650).release(.12).gain(.45)

$: n("<0 ~ 3 5>").scale("f:minor").s("sawtooth").lpf(1400).delay(.3).release(.2).gain(.3)
