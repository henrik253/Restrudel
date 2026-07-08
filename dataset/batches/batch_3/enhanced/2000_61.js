setcpm(28)

$: s("bd*2 ~ sd ~").bank("RolandTR909").gain(0.74).release(.05)

$: s("~ hh ~ hh").bank("RolandTR909").gain(0.25)

$: note("a2 e2 a2 e2").scale("a:minor").s("sawtooth").lpf(690).resonance(.2).release(.1).gain(0.39)

$: note("0").scale("a:minor").s("sine").lpf(2000).room(.4).delay(.3).gain(.15).slow(4)
