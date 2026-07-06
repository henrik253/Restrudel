setcpm(110/4)

$: s("bd ~ sd ~").bank("LinnDrum").gain(.8)

$: s("shaker_small:3*4").gain(.2)

$: note("g5 b5 g5 c5 e5 a5 e5 c5 f5 a5 f5 a5 d5 e5 f5 g5").s("sawtooth").lpf(3000).resonance(6).release(.15).delay(.4).room(.3).gain(.4)

$: note("g2 a#2 d#3 c3").s("sawtooth").lpf(600).release(.3).gain(.5)
