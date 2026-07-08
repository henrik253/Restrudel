setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: s("~ hh ~ hh").gain(.2)

$: note("g5 d5 g5 b5 g5 c5 e5 a5 e5 c5 f5 a5 f5 a5 f5 ~").s("square").lpf(2000).gain(.35)

$: s("dino").note("g5 ~ ~ ~ d5 ~ ~ ~ c5 ~ ~ ~ f5 ~ ~ ~").gain(.3)
