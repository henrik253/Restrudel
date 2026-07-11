setcpm(30)

$: s("bd*2 ~ sd ~").bank("RolandTR909").gain(0.75).release(.05)

$: s("~ hh ~ hh").bank("RolandTR909").gain(0.21)

$: note("d3 a2 d3 a2").scale("d:minor").s("sawtooth").lpf(957).resonance(.2).release(.1).gain(0.30)

$: note("0").scale("d:minor").s("sine").lpf(2000).room(.4).delay(.3).gain(.15).slow(4)
