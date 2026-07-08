setcpm(128/4)

$: s("bd*2 ~ bd ~").bank("RolandTR909").gain(.85)

$: s("~ cp ~ cp").gain(.4)

$: s("hh*8").gain(.18)

$: s("pulse ~ ~ ~").note("c2 ~ g1 ~").lpf(700).release(.2).gain(.4)

$: s("clavisynth ~ clavisynth ~").note("<c4 e4 g4>").lpf(1600).room(.3).gain(.4)
