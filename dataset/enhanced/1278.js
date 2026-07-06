setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.16)

$: n("2 ~ -5 ~ 2 4 -5 ~").scale("c:major").s("sawtooth").lpf(2500).resonance(6).release(.2).delay(.4).room(.3).gain(.35)

$: n("<c2 c2 g1 a1>").scale("c:major").s("gm_tuba").hpf(80).lpf(800).release(.3).gain(.4)
