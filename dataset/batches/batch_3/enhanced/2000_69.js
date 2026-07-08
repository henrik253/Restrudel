setcpm(30)

$: s("bd*2 ~ sd ~").bank("RolandTR909").gain(0.70).release(.05)

$: s("~ hh ~ hh").bank("RolandTR909").gain(0.30)

$: note("a2 e2 a2 e2").scale("a:minor").s("sawtooth").lpf(836).resonance(.2).release(.1).gain(0.31)

