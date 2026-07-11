setcpm(32)

$: s("bd*2 ~ sd ~").bank("RolandTR909").gain(0.68).release(.05)

$: s("~ hh ~ hh").bank("RolandTR909").gain(0.22)

$: note("e3 b2 e3 b2").scale("e:minor").s("sawtooth").lpf(755).resonance(.2).release(.1).gain(0.45)

$: note("0 3 7 ~ 5 3").scale("e:minor:pentatonic").s("square").lpf(1155).decay(.2).sustain(.3).release(.1).gain(0.35)

$: note("0").scale("e:minor").s("sine").lpf(2000).room(.4).delay(.3).gain(.15).slow(4)
