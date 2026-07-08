setcpm(120/4)

$: s("bd ~ sd ~").bank("AkaiLinn").gain(.85)

$: s("~ cp*2 ~ cp").gain(.3)

$: s("hh*8").gain(.16)

$: n("2 1 1 ~ 2 4 1 ~").scale("c:major").s("gm_overdriven_guitar:3").lpf(2500).release(.2).room(.3).gain(.35)

$: note("a3 c4 e4 c4 g4 d4 b3 g3").s("sawtooth").lpf(700).release(.25).gain(.45)
