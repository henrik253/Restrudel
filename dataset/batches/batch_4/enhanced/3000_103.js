setcpm(120/4)

$: s("bd*2 ~ sd ~").bank("RolandTR909").gain(.7)

$: s("hh*4 ~ hh*2").gain(.19)

$: note("c2 d3 c2 a2").scale("c:minor").s("sawtooth").lpf(3500).release(.12).gain(.45)

$: note("7 5 3 5").scale("c:minor").s("sawtooth").lpf(2000).gain(.35).room(.1)
