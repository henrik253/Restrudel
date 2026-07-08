setcpm(120/4)

$: s("bd ~ sd ~ bd*2 sd").gain(.68)

$: s("~ hh ~ hh").gain(.2)

$: note("c2 d3 c2 a2").scale("c:dorian").s("sawtooth").lpf(3200).release(.12).gain(.45)

$: note("7 5 3 7").scale("c:dorian").s("sawtooth").lpf(2000).gain(.35).room(.1)
