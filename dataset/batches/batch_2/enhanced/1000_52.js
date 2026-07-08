setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("lt*4").gain("[.7 .35]*4")

$: s("bell ~ bell ~").slow(2).gain(.4).room(.5)

$: note("<c2 g1 eb2 g1>").sound("sawtooth").lpf(700).release(.2).gain(.4)
