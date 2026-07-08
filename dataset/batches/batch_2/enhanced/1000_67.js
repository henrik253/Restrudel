setcpm(125/4)

$: s("bd sd bd sd").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.15)

$: note("<c2 g1 f1 c2>").s("sawtooth").lpf(600).release(.2).gain(.5)

$: n("0 3 5 7").scale("c:minor").s("square").lpf(1200).release(.15).gain(.35)

$: s("gm_overdriven_guitar:6 ~ ~ ~").gain(.4)
