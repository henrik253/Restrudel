setcpm(30)

$: s("bd*2 ~ sd ~").bank("RolandTR909").gain(0.69).release(.05)

$: s("~ hh ~ hh").bank("RolandTR909").gain(0.16)

$: note("c3 g2 c3 g2").scale("c:minor").s("sawtooth").lpf(628).resonance(.2).release(.1).gain(0.40)

$: note("0 3 7 ~ 5 3").scale("c:minor:pentatonic").s("square").lpf(1028).decay(.2).sustain(.3).release(.1).gain(0.30)

