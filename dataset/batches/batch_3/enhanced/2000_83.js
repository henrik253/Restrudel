setcpm(30)

$: s("bd*2 ~ sd ~").bank("RolandTR909").gain(0.76).release(.05)

$: s("~ hh ~ hh").bank("RolandTR909").gain(0.26)

$: note("g2 d2 g2 d2").scale("g:minor").s("sawtooth").lpf(776).resonance(.2).release(.1).gain(0.40)

