setcpm(128/4)

$: note("a2 ~ a2 ~ a2 ~ ~ a2").s("square").lpf(320).release(.15).gain(.5)

$: s("bd*4").bank("RolandTR808").gain(.85)

$: s("hh*16").gain("[.2 .12]*8")

$: s("~ cp ~ cp").bank("RolandTR808").gain(.55).room(.3)

$: n("<0 ~ 2 ~>").scale("a:minor").s("bell").gain(.3).room(.6).slow(2)
