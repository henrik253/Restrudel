setcpm(115/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.18)

$: n("<0 4 7 5>").scale("a:minor").s("piano").lpf(2500).release(.3).room(.3).gain(.35)

$: note("a2*8").s("sawtooth").room(.5).delay(.4).lpf(700).release(.2).gain(.45)

$: n("<a3 c4 e4 c4>").scale("a:minor").s("gm_reed_organ:5").lpf(2200).release(.4).room(.4).gain(.3)
