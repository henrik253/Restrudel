setcpm(100/4)

$: s("bd ~ bd ~").bank("RolandTR808").lpf(728).gain(.8)

$: s("~ cr ~ sd").gain(.6)

$: note("g5 e5 a5 g5").s("drum").lpf(5000).gain(.35).release(.1)
