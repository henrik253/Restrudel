setcpm(114/4)

$: s("bd ~ sd ~").bank("LinnDrum").gain(.85)

$: s("hh*16").gain(.12).release(.2)

$: note("a4 f3 a3 c4").s("sawtooth").lpf(1400).release(.25).room(.3).gain(.4)

$: s("gm_overdriven_guitar:2 ~").note("<a2 e2>").slow(2).lpf(700).gain(.4)
