setcpm(122/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.16)

$: note("g4 d5 e5 c5 g4 f4 d4 g4").s("gm_distortion_guitar").lpf(2500).release(.2).room(.5).delay(.4).gain(.3)

$: note("g2 d#2 f2 ~ g2 d#2 f2 ~").s("sawtooth").lpf(1800).room(.4).release(.25).gain(.45)
