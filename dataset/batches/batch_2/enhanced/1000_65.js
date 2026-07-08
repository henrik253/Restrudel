setcpm(115/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.8)

$: s("hh*8").gain(.15)

$: n("4 9 4 9 4").scale("ab4:minor:pentatonic").s("gm_drawbar_organ").release(.2).gain(.4)

$: note("<Ab1 Eb1>").s("supersaw").lpf(500).release(.3).gain(.5)
