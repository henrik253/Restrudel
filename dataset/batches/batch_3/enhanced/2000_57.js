setcpm(28)

$: s("bd*2 ~ sd ~").bank("RolandTR909").gain(0.65).release(.05)

$: s("~ hh ~ hh").bank("RolandTR909").gain(0.25)

$: note("g2 d2 g2 d2").scale("g:minor").s("sawtooth").lpf(705).resonance(.2).release(.1).gain(0.31)

$: note("0").scale("g:minor").s("sine").lpf(2000).room(.4).delay(.3).gain(.15).slow(4)
