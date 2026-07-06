setcpm(130/4)

$: s("bd*2 ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").fast(2).gain(.16)

$: n("0 1 4 4 4 12 6 ~").scale("c:minor").s("sawtooth").lpf(700).hpf(200).release(.2).delay(.3).gain(.35)

$: n("5 6 6 6").scale("c:minor").s("square").lpf(2800).room(.4).release(.3).attack(.04).gain(.4)

$: note("<c2 c2 g1 a#1>").s("sawtooth").lpf(650).release(.25).gain(.5)
