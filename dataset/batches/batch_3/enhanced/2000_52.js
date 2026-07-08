setcpm(32)

$: s("bd*2 ~ sd ~").bank("RolandTR909").gain(0.70).release(.05)

$: s("~ hh ~ hh").bank("RolandTR909").gain(0.27)

$: note("d3 a2 d3 a2").scale("d:minor").s("sawtooth").lpf(606).resonance(.2).release(.1).gain(0.38)

