setcpm(96/4)

$: s("bd ~ hh ~").gain(.7)

$: note("c1 f1 g1 c1").s("square").lpf(299).gain(.4)

$: note("g2 b2").s("triangle").gain(.35).release(.4029)
