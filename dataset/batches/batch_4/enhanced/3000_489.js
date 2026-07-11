setcpm(110/4)

$: s("gm_electric_bass_finger:2 hh*2").gain(.75).room(.2)

$: s("hh*8").gain(.2).room(.3)

$: n("0 -7!8 5!2 ~").scale("C:hirajoshi").s("sawtooth").lpf(500).gain(.5).release(.15)

$: n("4 5 7 5 4 2 0 ~").scale("C:hirajoshi").s("square").lpf(1800).resonance(4).gain(.4).release(.2)

$: n("0").scale("C:hirajoshi").s("sine").lpf(1200).room(.6).gain(.12).release(.4)

