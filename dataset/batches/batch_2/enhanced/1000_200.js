setcpm(96/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.2)

$: s("gm_drawbar_organ cp:12").gain(.6).room(.3)

$: note("<e5 g4 c5 b4>").s("gm_drawbar_organ").velocity(.5).release(.3)
