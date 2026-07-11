setcpm(122/4)

$: s("bd*2 ~ bd ~").bank("RolandTR909").gain(.85)

$: s("~ sd ~ sd").bank("RolandTR909").gain(.6)

$: s("~ cp ~ ~").room(.6).speed(1).gain(.5)

$: note("c4 c4 c4 c4").s("gm_oboe").lpf(1465).clip(1).gain(.4).room(.4)

$: note("<c2 g1 eb2 bb1>").s("sawtooth").lpf(600).release(.25).gain(.5)
