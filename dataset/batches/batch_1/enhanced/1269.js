setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("conga*3 ~").gain(.2)

$: s("hh*8").gain(.16)

$: n("5 ~ 3 ~ 5 3 0 ~").scale("c:major").s("gm_acoustic_guitar_steel:2").lpf(2500).release(.2).room(.4).gain(.35)

$: n("<c2 c2 g1 a1>").scale("c:major").s("gm_overdriven_guitar:6").lpf(650).release(.25).gain(.4)
