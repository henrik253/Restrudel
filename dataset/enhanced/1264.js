setcpm(115/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ sd:1 ~ sd:1").gain(.4)

$: s("hh*8").gain(.16)

$: note("g#4 ~ a#4 f#4 ~ g#4 a#4 b4").s("pad").lpf(2200).release(.4).room(.5).gain(.3)

$: n("4 6 4 ~ 7 2 4 ~").scale("f#:minor").s("sawtooth").hpf(120).lpf(1800).release(.25).gain(.4)
