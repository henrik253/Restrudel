setcpm(120/4)

$: s("bd ~ sd ~").bank("LinnDrum").gain(.8)

$: s("~ cp:12 ~ cp:12").gain(.35)

$: s("oh*4").gain(.16)

$: note("g4 d4 e4 c4 a3 f4 c4 a3").s("sawtooth").lpf(2500).resonance(6).release(.2).delay(.4).room(.3).gain(.35)

$: n("<c2 c2 g1 a1>").scale("c:major").s("gm_drawbar_organ").lpf(700).release(.3).gain(.4)
