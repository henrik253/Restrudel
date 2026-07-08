setcpm(100/4)

$: s("drum cp").gain(.7).lpf(800)

$: note("c1 f1 g1 c1 f1 g1").s("square").lpf(800).gain(.4)

$: note("c4 c5").s("ellipse").speed(1.3).delay(.4).gain(.35)
