setcpm(32)

$: s("bd*2 ~ sd ~").bank("RolandTR909").gain(0.64).release(.05)

$: s("~ hh ~ hh").bank("RolandTR909").gain(0.26)

$: note("g2 d2 g2 d2").scale("g:minor").s("sawtooth").lpf(724).resonance(.2).release(.1).gain(0.42)

$: note("0 3 7 ~ 5 3").scale("g:minor").s("square").lpf(1124).decay(.2).sustain(.3).release(.1).gain(0.32)

