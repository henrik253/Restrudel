setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.18)

$: note("e4 c4 g4 e4").s("piano").clip("[.5 1]*2").lpf(2500).room(.3).gain(.35)

$: n("0 4 7 5 7 4 0 3 5 7 5 3 0 2 4 ~").scale("c:major").s("gm_marimba").release(.2).delay(.3).gain(.35)

$: note("<c2 g1 c2 a1>").s("supersaw").lpf(800).room(.4).release(.3).hpf(120).gain(.45)
