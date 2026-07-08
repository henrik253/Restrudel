setcpm(28)

$: s("bd*2 ~ sd ~").bank("RolandTR909").gain(0.72).release(.05)

$: s("~ hh ~ hh").bank("RolandTR909").gain(0.30)

$: note("c3 g2 c3 g2").scale("c:minor").s("sawtooth").lpf(884).resonance(.2).release(.1).gain(0.34)

