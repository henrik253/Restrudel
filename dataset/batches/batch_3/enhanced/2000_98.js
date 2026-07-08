setcpm(28)

$: s("bd*2 ~ sd ~").bank("RolandTR909").gain(0.80).release(.05)

$: s("~ hh ~ hh").bank("RolandTR909").gain(0.18)

$: note("d3 a2 d3 a2").scale("d:minor").s("sawtooth").lpf(834).resonance(.2).release(.1).gain(0.44)

$: note("0 3 7 ~ 5 3").scale("d:minor:pentatonic").s("square").lpf(1234).decay(.2).sustain(.3).release(.1).gain(0.34)

