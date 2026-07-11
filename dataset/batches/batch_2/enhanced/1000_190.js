setcpm(100/4)

$: s("gm_harmonica ~ perc*4 ~").clip(1).release(.05).gain(.7)

$: s("hh*8").gain(.2)

$: note("e5 g5 c6 g5").gain(.35).room(.2).lpf(2500)

$: s("square ~ square ~").gain(.3).lpf(1800)
