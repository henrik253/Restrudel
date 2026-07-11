setcpm(130)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)
$: n("0 3 5 3").scale("f:major").s("sawtooth").lpf(1200).gain(.45).release(.8).room(.3)
$: n("4 ~ 7 ~ 5 3 0 ~").scale("c:major").s("square").lpf(1500).gain(.35).release(.6).room(.4).delay(.2)
