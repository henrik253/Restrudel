setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: s("hh*16").slow(2).gain(.2)

$: note("c2*4 c5@2 b4 ~").sound("sawtooth").lpf(1500).gain(.4).release(.4)

$: note("a3 f3 c4 g3").sound("piano").lpf(2200).gain("0.3 0.6 0.5 0.7").hpf(400)
