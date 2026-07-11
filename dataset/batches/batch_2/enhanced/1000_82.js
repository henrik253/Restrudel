setcpm(115/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ hh ~ hh").gain(.2)

$: note("e2 ~ e3 ~").s("gm_drawbar_organ").gain(.4)

$: note("e4 g4 b4 e5").s("sawtooth").gain(.3).release(.1)
