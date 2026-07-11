setcpm(95/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.8)

$: s("hh*8").gain(.15)

$: s("vocal:1 ~ vocal:2 ~").room(.4).gain(.5)

$: n("0 2 4 6 4 2").scale("bb4:minor").s("sawtooth").lpf(1000).release(.2).gain(.4)

$: note("<Bb1 F1>").s("sine").lpf(500).release(.3).gain(.5)
