setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.16)

$: note("d2 a2 g2 f2").add(12).s("gm_pad_warm").s("triangle").lpf(2200).release(.4).room(.4).gain(.3)

$: note("d2*8").s("square").lpf(700).release(.2).gain(.45)

$: note("~ ~ ~ c#5 ~ ~ ~ ~").s("sawtooth").lpf(3500).release(.2).delay(.3).gain(.3)
