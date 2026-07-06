setcpm(120/4)

$: s("bd ~ sd ~").bank("LinnDrum").gain(.8)

$: s("hh*8").gain(.18)

$: note("g4 a4 c5 a4 g4 e4 d4 g4").s("sawtooth").lpf(2500).resonance(6).release(.2).delay(.4).room(.3).gain(.35)

$: note("<g1 g1 d2 c2>").s("square").lpf(650).release(.25).gain(.5)
