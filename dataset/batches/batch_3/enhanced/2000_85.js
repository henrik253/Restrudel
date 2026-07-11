setcpm(35)

$: s("bd*2 ~ sd ~").bank("RolandTR909").gain(0.70).release(.05)

$: s("~ hh ~ hh").bank("RolandTR909").gain(0.22)

$: note("e3 b2 e3 b2").scale("e:minor").s("sawtooth").lpf(811).resonance(.2).release(.1).gain(0.43)

$: note("0").scale("e:minor").s("sine").lpf(2000).room(.4).delay(.3).gain(.15).slow(4)
