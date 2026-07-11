setcpm(28)

$: s("bd*2 ~ sd ~").bank("RolandTR909").gain(0.61).release(.05)

$: s("~ hh ~ hh").bank("RolandTR909").gain(0.19)

$: note("e3 b2 e3 b2").scale("e:minor").s("sawtooth").lpf(878).resonance(.2).release(.1).gain(0.44)

$: note("0 3 7 ~ 5 3").scale("e:minor:pentatonic").s("square").lpf(1278).decay(.2).sustain(.3).release(.1).gain(0.34)

