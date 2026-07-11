setcpm(118/4)

$: s("bd ~ ~ bd ~ ~ bd ~").bank("LinnDrum").gain(.85)

$: s("~ cp ~ cp").bank("LinnDrum").gain(.5)

$: s("hh*8").bank("LinnDrum").gain(.18)

$: n("~ 1*3 ~ 6*3 5").scale("c:major").s("sawtooth").clip(1).release(.4).lpf(1400).room(.3).gain(.4)

$: n("0 ~ 4 ~").scale("c:major").s("square").lpf(500).release(.2).gain(.4)
