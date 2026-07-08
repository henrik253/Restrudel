setcpm(120/4)

$: s("bd ~ sd ~ bd*2 sd").gain(.68)

$: s("hh*4 ~ hh*2").gain(.19)

$: note("g2 d3 g2 a2").scale("g:minor").s("sawtooth").lpf(3200).release(.12).gain(.45)

$: note("7 5 3 5").scale("g:minor").s("sawtooth").lpf(2000).gain(.35).room(.1)
