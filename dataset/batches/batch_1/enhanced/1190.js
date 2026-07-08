setcpm(118/4)

$: s("bd*4").bank("RolandTR808").gain(.85)

$: s("~ sd ~ sd").bank("RolandTR808").gain(.7)

$: n("0 3 5 7 5 3 0 -3").scale("f:minor").s("kalimba").lpf(3000).release(.3).room(.3).delay(.3).gain(.4)

$: n("<f1 c2 ab1 eb2>").scale("f:minor").s("sawtooth").lpf(600).release(.3).gain(.5)
