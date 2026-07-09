setcpm(120/4)

$: s("bd*2 ~ sd ~").bank("RolandTR909").gain(.7)

$: s("~ hh ~ hh").gain(.2)

$: note("d2 d3 d2 a2").scale("d:minor").s("sawtooth").lpf(3200).release(.12).gain(.45)

$: note("7 5 3 5").scale("d:minor").s("sawtooth").lpf(2000).gain(.35).room(.1)
