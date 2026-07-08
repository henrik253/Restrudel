setcpm(110)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)
$: s("hh*8").gain(.2)
$: n("0 3 5 3").scale("g:major").s("sawtooth").lpf(1200).gain(.45).release(.8).room(.3)
