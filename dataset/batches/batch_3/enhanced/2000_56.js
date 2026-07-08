setcpm(30)

$: s("bd*2 ~ sd ~").bank("RolandTR909").gain(0.78).release(.05)

$: s("~ hh ~ hh").bank("RolandTR909").gain(0.19)

$: note("c3 g2 c3 g2").scale("c:minor").s("sawtooth").lpf(629).resonance(.2).release(.1).gain(0.43)

$: note("0").scale("c:minor").s("sine").lpf(2000).room(.4).delay(.3).gain(.15).slow(4)
