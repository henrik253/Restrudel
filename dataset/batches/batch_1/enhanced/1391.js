setcpm(116/4)

$: s("bd ~ sd ~").bank("LinnDrum").gain("<.7 .85>")

$: s("hh*4 ~ hh*2 hh").room(.7).gain(.2)

$: s("rd ~ rd rd").slow(2).gain(.25)

$: n("<0 3 2 ~>").scale("c:dorian").s("gm_ocarina").gain(.3).room(.5).release(.3)

$: note("c2 ~ eb2 ~").s("square").lpf(500).release(.2).gain(.5)
