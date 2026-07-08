setcpm(32)

$: s("bd*2 ~ sd ~").bank("RolandTR909").gain(0.62).release(.05)

$: s("~ hh ~ hh").bank("RolandTR909").gain(0.21)

$: note("a2 e2 a2 e2").scale("a:minor").s("sawtooth").lpf(797).resonance(.2).release(.1).gain(0.31)

