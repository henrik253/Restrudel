setcpm(100/4)

$: s("supersaw hh!6").gain(.75).room(.2)

$: s("hh*8").gain(.2).room(.3)

$: n("2 2 2 2 ~ 9 10 9 7 ~ 11 8 ~ ~ 9 10 9 7 ~ 11").scale("g4:dorian").s("sawtooth").lpf(500).gain(.5).release(.15)

$: n("4 5 7 5 4 2 0 ~").scale("g4:dorian").s("square").lpf(1800).resonance(4).gain(.4).release(.2)

$: n("0").scale("g4:dorian").s("sine").lpf(1200).room(.6).gain(.12).release(.4)

