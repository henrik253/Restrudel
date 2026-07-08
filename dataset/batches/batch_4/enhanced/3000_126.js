setcpm(80/4)

$: s("bd*2 ~ sd ~").bank("RolandTR909").gain(.7)

$: s("~ hh ~ hh").gain(.2)

$: note("g2 d3 g2 a2").scale("g:dorian").s("sawtooth").lpf(3200).release(.12).gain(.45)

$: note("7 5 3 7").scale("g:dorian").s("sawtooth").lpf(2000).gain(.35).room(.25)
