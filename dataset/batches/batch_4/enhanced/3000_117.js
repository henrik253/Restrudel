setcpm(80/4)

$: s("bd ~ sd ~ bd*2 sd").gain(.68)

$: s("~ hh ~ hh").gain(.2)

$: note("g2 d3 g2 a2").scale("g:minor").s("square").lpf(3500).release(.12).gain(.45).resonance(3)

$: note("7 5 3 5").scale("g:minor").s("triangle").lpf(2000).gain(.35).room(.25).resonance(4)
