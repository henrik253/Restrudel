setcpm(128/4)

$: s("bd*2 ~ bd ~").bank("RolandTR909").gain(.85)

$: s("~ cp ~ cp").gain(.4).room(.3)

$: s("hh*8").gain(.2)

$: note("a4 c5 e5 c5 a4 g4 e4 c4").s("supersaw").lpf(2800).resonance(5).release(.3).room(.4).delay(.3).gain(.35)

$: note("a2 a3 a2 a3 e2 e3 a2 a2").s("gm_distortion_guitar").clip(.5).release(.3).lpf(1200).gain(.4)
