setcpm(112/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("hh*8 cowbell:3 ~ cr ~").bank("RolandTR808").gain(.2)

$: note("c4*2 c4 a#3 c4").s("sawtooth").lpf(1000).release(.2).gain(.35)

$: note("c1 f1 g1").s("square").lpf(500).release(.25).gain(.4)

$: s("gtr ~ ~ ~").slow(2).gain(.4).room(.4)
